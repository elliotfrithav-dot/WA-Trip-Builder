import { regions, PERTH } from '../../data/regions'
import { campsitesForRegion } from '../../data/campsites'
import { activitySitesForRegion } from '../../data/activitySites'
import { wildlifeForRegion } from '../../data/wildlife'
import { fetchWeatherForecast, weatherForDate } from '../../services/weather'
import { fetchMarineForecast, marineForDate } from '../../services/marine'
import { estimateTide } from '../../services/tides'
import { gradeSiteConditions, findBestDays, GRADE_LABEL } from '../../services/siteConditions'
import { isDogOk } from '../../lib/dogPolicy'
import type { TripCriteria, TripOption, ScoreBreakdown } from './types'
import type { Region, ActivitySite } from '../../data/types'

const WATER_ACTIVITIES = ['snorkelling', 'shore-diving', 'scuba-diving', 'swimming'] as const

function wantsWaterActivity(criteria: TripCriteria): boolean {
  return (
    criteria.activities.length === 0 ||
    criteria.activities.some((a) => (WATER_ACTIVITIES as readonly string[]).includes(a))
  )
}

function nightsBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
}

function tripTitle(region: Region): string {
  const firstClause = region.blurb.split(/,| — /)[0].trim()
  return `${region.name} — ${firstClause}`
}

function candidateRegions(criteria: TripCriteria): Region[] {
  const maxMinutes = criteria.maxDriveHours * 60 + 20 // small tolerance
  return regions.filter((r) => r.driveTimeFromPerthMin <= maxMinutes)
}

// ---------------------------------------------------------------------------
// Multi-day (camping/overnight) scoring
// ---------------------------------------------------------------------------

async function scoreMultiDayRegion(region: Region, criteria: TripCriteria): Promise<TripOption | null> {
  const campsites = campsitesForRegion(region.id)
  const sites = activitySitesForRegion(region.id)
  const wildlife = wildlifeForRegion(region.id)
  const nights = nightsBetween(criteria.startDate, criteria.endDate)

  // --- Hard filters ---
  // Only require a matching campsite when the user picked a *specific* camping
  // type. "Don't care" and "No camping" both allow a region through regardless
  // of whether it happens to have seed campsite data.
  if (criteria.campingPreference !== 'no-camping' && criteria.campingPreference !== 'dont-care') {
    const hasMatchingCampsite = campsites.some((c) => c.campingType === criteria.campingPreference)
    if (!hasMatchingCampsite) return null
  }

  let dogFriendly = true
  if (criteria.bringingDog) {
    const campsiteDogOk = campsites.length === 0 || campsites.some((c) => isDogOk(c.dogPolicy))
    if (criteria.campingPreference !== 'no-camping' && !campsiteDogOk) return null
    dogFriendly = campsiteDogOk
  }

  const breakdown: ScoreBreakdown[] = []
  const warnings: string[] = []

  // --- Distance suitability (closer to the limit's "sweet spot" scores higher) ---
  const driveRatio = region.driveTimeFromPerthMin / (criteria.maxDriveHours * 60)
  const distancePoints = Math.round(20 - Math.min(20, Math.abs(driveRatio - 0.7) * 30))
  breakdown.push({
    label: 'Distance suitability',
    points: Math.max(4, distancePoints),
    maxPoints: 20,
    reason: `${Math.round(region.driveTimeFromPerthMin)} min drive against your ${criteria.maxDriveHours}h limit`,
  })

  // --- Activity match ---
  const wantedActivities = criteria.activities.length > 0 ? criteria.activities : region.activities
  const matchedActivities = region.activities.filter((a) => wantedActivities.includes(a))
  const activityPoints =
    criteria.activities.length === 0
      ? 14
      : Math.round((matchedActivities.length / criteria.activities.length) * 20)
  breakdown.push({
    label: 'Activity match',
    points: Math.min(20, activityPoints),
    maxPoints: 20,
    reason:
      criteria.activities.length === 0
        ? 'Open to anything — scored on variety of activities available'
        : `Matches ${matchedActivities.length}/${criteria.activities.length} requested activities`,
  })

  // --- Live weather + marine conditions for the trip's first day ---
  let weatherPoints = 10
  let marinePoints = 10
  let weatherReason = 'Forecast unavailable for this date — verify closer to departure.'
  let marineReason = 'Marine forecast unavailable for this date — verify closer to departure.'

  try {
    const forecast = await fetchWeatherForecast(region.id, region.lat, region.lng)
    const day = weatherForDate(forecast, criteria.startDate)
    if (day) {
      const rainPenalty = Math.min(10, day.precipitationMm * 2)
      const windPenalty = day.windGustsMaxKmh > 35 ? Math.min(10, (day.windGustsMaxKmh - 35) / 3) : 0
      weatherPoints = Math.max(2, Math.round(20 - rainPenalty - windPenalty))
      weatherReason = `${Math.round(day.tempMaxC)}°C max, ${day.precipitationMm.toFixed(1)}mm rain, gusts to ${Math.round(day.windGustsMaxKmh)}km/h`
    } else {
      weatherPoints = 12
    }
  } catch {
    weatherPoints = 10
    warnings.push('Live weather could not be loaded — check forecast before travelling.')
  }

  if (wantsWaterActivity(criteria)) {
    try {
      const marine = await fetchMarineForecast(region.id, region.lat, region.lng)
      const day = marineForDate(marine, criteria.startDate)
      if (marine.unavailable || !day) {
        marinePoints = 10
        marineReason = 'Data unavailable — verify marine conditions before travelling.'
      } else {
        const swellPenalty = day.swellWaveHeightMaxM > 1.2 ? Math.min(15, (day.swellWaveHeightMaxM - 1.2) * 15) : 0
        marinePoints = Math.max(2, Math.round(20 - swellPenalty))
        marineReason = `Swell ~${day.swellWaveHeightMaxM.toFixed(1)}m, wave period ${Math.round(day.swellWavePeriodMaxS)}s`
      }
    } catch {
      marinePoints = 10
      warnings.push('Live marine forecast could not be loaded — check swell/wind before diving or snorkelling.')
    }
  } else {
    marinePoints = 14 // neutral — not relevant to this trip's activities
    marineReason = 'Not a primary factor for the selected activities'
  }

  breakdown.push({ label: 'Weather', points: weatherPoints, maxPoints: 20, reason: weatherReason })
  breakdown.push({ label: 'Marine conditions', points: marinePoints, maxPoints: 20, reason: marineReason })

  // --- Tide (astronomical spring/neap estimate only) ---
  const tide = estimateTide(criteria.startDate)
  warnings.push(`Tide: ${tide.label}. ${tide.disclaimer}`)

  // --- Wildlife season ---
  const month = new Date(criteria.startDate).getMonth() + 1
  const inSeasonWildlife = wildlife.filter((w) => w.season.monthsPossible.includes(month))
  const wildlifePoints = Math.min(10, inSeasonWildlife.length * 3)
  breakdown.push({
    label: 'Wildlife season',
    points: wildlifePoints,
    maxPoints: 10,
    reason:
      inSeasonWildlife.length > 0
        ? `${inSeasonWildlife.map((w) => w.commonName).join(', ')} possible this month`
        : 'No standout wildlife season match for this month',
  })

  // --- Dog suitability ---
  const dogPoints = !criteria.bringingDog ? 10 : dogFriendly ? 10 : 0
  breakdown.push({
    label: 'Dog suitability',
    points: dogPoints,
    maxPoints: 10,
    reason: criteria.bringingDog
      ? dogFriendly
        ? 'Dog-friendly camping and access confirmed in seed data'
        : 'Limited dog access — verify before bringing your dog'
      : 'Not travelling with a dog',
  })
  if (criteria.bringingDog && campsites.some((c) => c.dogPolicy === 'seasonal-restrictions')) {
    warnings.push('One or more campsites here have seasonal dog restrictions — verify current rules.')
  }

  const totalMax = breakdown.reduce((s, b) => s + b.maxPoints, 0)
  const totalPoints = breakdown.reduce((s, b) => s + b.points, 0)
  const score = Math.round((totalPoints / totalMax) * 100)

  const topReasons = [...breakdown]
    .sort((a, b) => b.points / b.maxPoints - a.points / a.maxPoints)
    .slice(0, 3)
    .map((b) => b.reason)

  return {
    id: `${region.id}-${criteria.startDate}`,
    regionId: region.id,
    title: tripTitle(region),
    nights,
    driveTimeMin: region.driveTimeFromPerthMin,
    driveDistanceKm: region.driveDistanceFromPerthKm,
    score,
    scoreBreakdown: breakdown,
    whySummary: topReasons.join('. ') + '.',
    campsiteIds: campsites.map((c) => c.id),
    activitySiteIds: sites.map((s) => s.id),
    wildlifeIds: inSeasonWildlife.map((w) => w.id),
    dogFriendly,
    estimatedBudget: criteria.budget ?? 'moderate',
    warnings,
  }
}

// ---------------------------------------------------------------------------
// Day-trip scoring — snorkel/swim/hike trips with no overnight stay. Distance
// rewards being close (not a "sweet spot"), and water activities are graded
// against a specific site's live conditions rather than a regional average.
// ---------------------------------------------------------------------------

async function scoreDayTripRegion(region: Region, criteria: TripCriteria): Promise<TripOption | null> {
  const sites = activitySitesForRegion(region.id)
  const wildlife = wildlifeForRegion(region.id)

  const wantedActivities = criteria.activities.length > 0 ? criteria.activities : region.activities
  const matchedActivities = region.activities.filter((a) => wantedActivities.includes(a))
  if (criteria.activities.length > 0 && matchedActivities.length === 0) return null

  // A region's high-level activity tags (e.g. Cervantes lists "snorkelling"
  // for the broader coastline) don't guarantee an actual mapped site here.
  // If the user specifically asked for a water activity, require a real
  // water-capable site rather than recommending a region on reputation alone.
  const waterCapableSites = sites.filter((s) => s.type === 'snorkel' || s.type === 'dive' || s.type === 'beach')
  const requestedWaterActivities = criteria.activities.filter((a) =>
    (WATER_ACTIVITIES as readonly string[]).includes(a),
  )
  if (requestedWaterActivities.length > 0 && waterCapableSites.length === 0) return null

  const breakdown: ScoreBreakdown[] = []
  const warnings: string[] = []

  // --- Distance: closer is strictly better for a day trip ---
  const driveMin = region.driveTimeFromPerthMin
  const maxMin = criteria.maxDriveHours * 60
  const distancePoints = Math.max(2, Math.round(20 * (1 - Math.min(1, driveMin / maxMin) * 0.8)))
  breakdown.push({
    label: 'Distance suitability',
    points: distancePoints,
    maxPoints: 20,
    reason: `Only ${Math.round(driveMin)} min drive — more time at the site, less time in the car`,
  })

  // --- Activity match ---
  const activityPoints =
    criteria.activities.length === 0
      ? 14
      : Math.round((matchedActivities.length / criteria.activities.length) * 20)
  breakdown.push({
    label: 'Activity match',
    points: Math.min(20, activityPoints),
    maxPoints: 20,
    reason:
      criteria.activities.length === 0
        ? 'Open to anything — scored on variety of activities available'
        : `Matches ${matchedActivities.length}/${criteria.activities.length} requested activities`,
  })

  // --- Site-specific live conditions grading for water activities ---
  const primarySite: ActivitySite | undefined =
    sites.find((s) => s.type === 'snorkel' || s.type === 'dive') ?? waterCapableSites[0]
  let conditionsGrade: TripOption['conditionsGrade']
  let bestDayRecommendation: TripOption['bestDayRecommendation']

  if (wantsWaterActivity(criteria) && primarySite) {
    try {
      const [weather, marine] = await Promise.all([
        fetchWeatherForecast(region.id, region.lat, region.lng),
        fetchMarineForecast(region.id, region.lat, region.lng),
      ])
      const day = weatherForDate(weather, criteria.startDate)
      const marineDay = marineForDate(marine, criteria.startDate)
      conditionsGrade = gradeSiteConditions(primarySite, day, marineDay)

      breakdown.push({
        label: 'Conditions',
        points: Math.round((conditionsGrade.score / 100) * 30),
        maxPoints: 30,
        reason: `${primarySite.name}: ${GRADE_LABEL[conditionsGrade.grade]} (${conditionsGrade.factors.map((f) => `${f.label} ${GRADE_LABEL[f.grade].toLowerCase()}`).join(', ')})`,
      })

      if (criteria.findBestDay) {
        const ranked = findBestDays(primarySite, weather, marine)
        if (ranked.length > 0 && ranked[0].date !== criteria.startDate) {
          bestDayRecommendation = { date: ranked[0].date, result: ranked[0] }
        }
      }
    } catch {
      breakdown.push({
        label: 'Conditions',
        points: 15,
        maxPoints: 30,
        reason: 'Live conditions could not be loaded — check before you go.',
      })
      warnings.push('Live weather/marine forecast could not be loaded — check conditions before travelling.')
    }
  } else {
    // Non-water day trip (e.g. a hike) — fall back to plain weather.
    try {
      const weather = await fetchWeatherForecast(region.id, region.lat, region.lng)
      const day = weatherForDate(weather, criteria.startDate)
      if (day) {
        const rainPenalty = Math.min(15, day.precipitationMm * 3)
        const points = Math.max(3, Math.round(30 - rainPenalty))
        breakdown.push({
          label: 'Conditions',
          points,
          maxPoints: 30,
          reason: `${Math.round(day.tempMaxC)}°C max, ${day.precipitationMm.toFixed(1)}mm rain`,
        })
      } else {
        breakdown.push({ label: 'Conditions', points: 18, maxPoints: 30, reason: 'Forecast unavailable for this date.' })
      }
    } catch {
      breakdown.push({ label: 'Conditions', points: 15, maxPoints: 30, reason: 'Live weather could not be loaded.' })
    }
  }

  // --- Tide (astronomical spring/neap estimate only) ---
  const tide = estimateTide(criteria.startDate)
  warnings.push(`Tide: ${tide.label}. ${tide.disclaimer}`)

  // --- Wildlife in season ---
  const month = new Date(criteria.startDate).getMonth() + 1
  const inSeasonWildlife = wildlife.filter((w) => w.season.monthsPossible.includes(month))

  // --- Dog suitability — based on the actual site's policy, since day
  // trips have no campsite to fall back on. Most metro marine-park
  // snorkel sites prohibit dogs. ---
  const dogFriendly = primarySite ? isDogOk(primarySite.dogPolicy) : sites.every((s) => isDogOk(s.dogPolicy))
  const dogPoints = !criteria.bringingDog ? 10 : dogFriendly ? 10 : 0
  breakdown.push({
    label: 'Dog suitability',
    points: dogPoints,
    maxPoints: 10,
    reason: criteria.bringingDog
      ? dogFriendly
        ? 'Site allows dogs in seed data'
        : 'This site prohibits dogs (common in marine park sanctuary zones) — verify before bringing your dog'
      : 'Not travelling with a dog',
  })
  if (criteria.bringingDog && !dogFriendly && primarySite) {
    warnings.push(`${primarySite.name} does not allow dogs — verify if another spot nearby is more suitable.`)
  }

  const totalMax = breakdown.reduce((s, b) => s + b.maxPoints, 0)
  const totalPoints = breakdown.reduce((s, b) => s + b.points, 0)
  const score = Math.round((totalPoints / totalMax) * 100)

  const topReasons = [...breakdown]
    .sort((a, b) => b.points / b.maxPoints - a.points / a.maxPoints)
    .slice(0, 3)
    .map((b) => b.reason)

  return {
    id: `${region.id}-${criteria.startDate}`,
    regionId: region.id,
    title: tripTitle(region),
    nights: 0,
    driveTimeMin: region.driveTimeFromPerthMin,
    driveDistanceKm: region.driveDistanceFromPerthKm,
    score,
    scoreBreakdown: breakdown,
    whySummary: topReasons.join('. ') + '.',
    campsiteIds: [],
    activitySiteIds: sites.map((s) => s.id),
    wildlifeIds: inSeasonWildlife.map((w) => w.id),
    dogFriendly,
    estimatedBudget: criteria.budget ?? 'free',
    warnings,
    conditionsGrade,
    bestDayRecommendation,
  }
}

export async function generateTripOptions(criteria: TripCriteria): Promise<TripOption[]> {
  const candidates = candidateRegions(criteria)
  const scorer = criteria.tripLength === 'day-trip' ? scoreDayTripRegion : scoreMultiDayRegion
  const results = await Promise.all(candidates.map((r) => scorer(r, criteria)))
  const options = results.filter((o): o is TripOption => o !== null)
  options.sort((a, b) => b.score - a.score)
  return options.slice(0, 8)
}

export { PERTH }
