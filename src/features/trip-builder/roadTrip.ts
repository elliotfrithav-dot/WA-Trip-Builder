import { regions, PERTH, findRegion } from '../../data/regions'
import { campsitesForRegion } from '../../data/campsites'
import { activitySitesForRegion } from '../../data/activitySites'
import { wildlifeForRegion } from '../../data/wildlife'
import { fetchWeatherForecast, weatherForDate } from '../../services/weather'
import { fetchMarineForecast, marineForDate } from '../../services/marine'
import { estimateInterRegionDriveMin, haversineKm } from '../../services/distance'
import { estimateTide } from '../../services/tides'
import { isDogOk } from '../../lib/dogPolicy'
import type { TripCriteria, TripOption, ScoreBreakdown, RoadTripStop } from './types'
import type { Region } from '../../data/types'

// Regions ordered by distance from Perth in each direction. North-beach and
// Coogee (Perth-metro micro spots) are excluded — too close to make a
// sensible road-trip "leg".
const NORTH_CORRIDOR = [
  'two-rocks',
  'yanchep',
  'guilderton',
  'lancelin',
  'cervantes',
  'jurien-bay',
  'geraldton',
  'kalbarri',
  'shark-bay',
  'carnarvon',
  'coral-bay',
  'exmouth',
  'karratha',
  'port-hedland',
  'broome',
]
const SOUTH_CORRIDOR = [
  'fremantle',
  'rockingham',
  'mandurah',
  'bunbury',
  'busselton',
  'dunsborough',
  'yallingup',
  'margaret-river',
  'augusta',
  'walpole',
  'denmark',
  'albany',
  'esperance',
]

function nightsBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
}

function regionMatchScore(region: Region, criteria: TripCriteria): number {
  if (criteria.activities.length === 0) return 1
  return region.activities.filter((a) => criteria.activities.includes(a)).length
}

function regionPassesCampingFilter(region: Region, criteria: TripCriteria): boolean {
  if (criteria.campingPreference === 'no-camping' || criteria.campingPreference === 'dont-care') return true
  return campsitesForRegion(region.id).some((c) => c.campingType === criteria.campingPreference)
}

function regionDogOk(region: Region, criteria: TripCriteria): boolean {
  if (!criteria.bringingDog) return true
  if (criteria.campingPreference === 'no-camping') return true
  const camps = campsitesForRegion(region.id)
  return camps.length === 0 || camps.some((c) => isDogOk(c.dogPolicy))
}

function distributeNights(totalNights: number, stopCount: number): number[] {
  const base = Math.floor(totalNights / stopCount)
  const remainder = totalNights % stopCount
  return Array.from({ length: stopCount }, (_, i) => base + (i < remainder ? 1 : 0))
}

async function buildCorridorOption(
  corridorIds: string[],
  direction: 'north' | 'south',
  criteria: TripCriteria,
): Promise<TripOption | null> {
  const totalNights = nightsBetween(criteria.startDate, criteria.endDate)
  const requestedStops = Math.max(2, Math.min(criteria.roadTripStops ?? 3, totalNights))

  // Sanity cap: don't suggest a stop whose one-way drive from Perth alone
  // would eat an unreasonable chunk of the whole trip (e.g. Broome on a
  // 4-night trip). Generous 4h/night budget — still allows far stops on a
  // genuinely long trip.
  const maxOneWayDriveMin = totalNights * 240

  const candidates = corridorIds
    .map((id) => findRegion(id))
    .filter((r): r is Region => Boolean(r))
    .filter((r) => r.driveTimeFromPerthMin <= maxOneWayDriveMin)
    .filter((r) => regionPassesCampingFilter(r, criteria) && regionDogOk(r, criteria))

  if (candidates.length < 2) return null // need at least 2 stops for a "road trip"

  // Pick the best-matching regions, then restore geographic order so the
  // route actually makes sense to drive.
  const ranked = [...candidates].sort((a, b) => regionMatchScore(b, criteria) - regionMatchScore(a, criteria))
  const stopCount = Math.min(requestedStops, candidates.length)
  const chosen = ranked.slice(0, stopCount)
  const orderedStops = corridorIds.map((id) => chosen.find((r) => r.id === id)).filter((r): r is Region => Boolean(r))

  const nightsPerStop = distributeNights(totalNights, orderedStops.length)

  const stops: RoadTripStop[] = []
  let prevPoint: { lat: number; lng: number } = PERTH
  for (let i = 0; i < orderedStops.length; i++) {
    const region = orderedStops[i]
    const legDriveTimeMin = i === 0 ? region.driveTimeFromPerthMin : estimateInterRegionDriveMin(prevPoint, region)
    const legDriveDistanceKm = i === 0 ? region.driveDistanceFromPerthKm : Math.round(haversineKm(prevPoint, region) * 1.15)
    stops.push({
      regionId: region.id,
      nights: nightsPerStop[i],
      campsiteIds: campsitesForRegion(region.id).map((c) => c.id),
      activitySiteIds: activitySitesForRegion(region.id).map((s) => s.id),
      legDriveTimeMin,
      legDriveDistanceKm,
    })
    prevPoint = region
  }

  const breakdown: ScoreBreakdown[] = []
  const warnings: string[] = [
    'Live conditions were only checked for the first stop — check weather/swell for later stops closer to departure.',
  ]

  // --- Activity variety across the whole route ---
  const allActivities = new Set(orderedStops.flatMap((r) => r.activities))
  const matchedActivities =
    criteria.activities.length === 0 ? allActivities.size : [...allActivities].filter((a) => criteria.activities.includes(a)).length
  const activityPoints =
    criteria.activities.length === 0
      ? Math.min(25, allActivities.size * 3)
      : Math.round((matchedActivities / criteria.activities.length) * 25)
  breakdown.push({
    label: 'Activity variety',
    points: Math.min(25, activityPoints),
    maxPoints: 25,
    reason: `${orderedStops.length} stops covering ${allActivities.size} distinct activity types`,
  })

  // --- First-stop live conditions (representative) ---
  let weatherPoints = 15
  let weatherReason = 'Forecast unavailable — verify closer to departure.'
  try {
    const first = orderedStops[0]
    const forecast = await fetchWeatherForecast(first.id, first.lat, first.lng)
    const day = weatherForDate(forecast, criteria.startDate)
    if (day) {
      const rainPenalty = Math.min(15, day.precipitationMm * 2)
      weatherPoints = Math.max(3, Math.round(25 - rainPenalty))
      weatherReason = `${first.name} on day 1: ${Math.round(day.tempMaxC)}°C max, ${day.precipitationMm.toFixed(1)}mm rain`
    }
    const marine = await fetchMarineForecast(first.id, first.lat, first.lng)
    const marineDay = marineForDate(marine, criteria.startDate)
    if (marineDay) weatherReason += `, swell ~${marineDay.swellWaveHeightMaxM.toFixed(1)}m`
  } catch {
    warnings.push('Live weather could not be loaded for the first stop.')
  }
  breakdown.push({ label: 'Day-1 conditions', points: weatherPoints, maxPoints: 25, reason: weatherReason })

  // --- Camping availability ---
  const campingPoints = orderedStops.every((r) => campsitesForRegion(r.id).length > 0) ? 20 : 10
  breakdown.push({
    label: 'Camping availability',
    points: campingPoints,
    maxPoints: 20,
    reason: campingPoints === 20 ? 'All stops have seed campsite data' : 'One or more stops has no seed campsite data',
  })

  // --- Dog suitability ---
  const dogFriendly = orderedStops.every((r) => regionDogOk(r, criteria))
  breakdown.push({
    label: 'Dog suitability',
    points: !criteria.bringingDog ? 10 : dogFriendly ? 10 : 3,
    maxPoints: 10,
    reason: !criteria.bringingDog ? 'Not travelling with a dog' : dogFriendly ? 'Dog-friendly options at each stop' : 'Limited dog access at one or more stops',
  })

  // --- Route sensibility ---
  breakdown.push({
    label: 'Route',
    points: 18,
    maxPoints: 20,
    reason: `${direction === 'north' ? 'Northbound' : 'Southbound'} loop, visited in geographic order`,
  })

  const tide = estimateTide(criteria.startDate)
  warnings.push(`Tide: ${tide.label}. ${tide.disclaimer}`)
  const parkPassStops = orderedStops.filter((r) => r.parkPassRequired).map((r) => r.name)
  if (parkPassStops.length > 0) {
    warnings.push(`${parkPassStops.join(', ')} include${parkPassStops.length === 1 ? 's' : ''} a DBCA national park — a Park Pass or day-entry fee applies (exploreparks.dbca.wa.gov.au).`)
  }

  const totalMax = breakdown.reduce((s, b) => s + b.maxPoints, 0)
  const totalPoints = breakdown.reduce((s, b) => s + b.points, 0)
  const score = Math.round((totalPoints / totalMax) * 100)

  const wildlifeIds = new Set<string>()
  const month = new Date(criteria.startDate).getMonth() + 1
  for (const r of orderedStops) {
    for (const w of wildlifeForRegion(r.id)) {
      if (w.season.monthsPossible.includes(month)) wildlifeIds.add(w.id)
    }
  }

  const totalDriveTimeMin = stops.reduce((s, st) => s + st.legDriveTimeMin, 0)
  const totalDriveDistanceKm = stops.reduce((s, st) => s + st.legDriveDistanceKm, 0)

  return {
    id: `roadtrip-${direction}-${criteria.startDate}`,
    regionId: orderedStops[0].id,
    title: `${orderedStops.map((r) => r.name.split(' / ')[0].split(' —')[0]).join(' → ')} Road Trip`,
    nights: totalNights,
    driveTimeMin: totalDriveTimeMin,
    driveDistanceKm: totalDriveDistanceKm,
    score,
    scoreBreakdown: breakdown,
    whySummary: `${orderedStops.length}-stop ${direction}bound route covering ${[...allActivities].slice(0, 4).join(', ')}.`,
    campsiteIds: stops.flatMap((s) => s.campsiteIds),
    activitySiteIds: stops.flatMap((s) => s.activitySiteIds),
    wildlifeIds: [...wildlifeIds],
    dogFriendly,
    estimatedBudget: criteria.budget ?? 'moderate',
    warnings,
    stops,
  }
}

export async function generateRoadTripOptions(criteria: TripCriteria): Promise<TripOption[]> {
  const [north, south] = await Promise.all([
    buildCorridorOption(NORTH_CORRIDOR, 'north', criteria),
    buildCorridorOption(SOUTH_CORRIDOR, 'south', criteria),
  ])
  const options = [north, south].filter((o): o is TripOption => o !== null)
  options.sort((a, b) => b.score - a.score)
  return options
}

export { regions }
