import { findRegion, PERTH } from '../../data/regions'
import { campsites } from '../../data/campsites'
import { activitySites } from '../../data/activitySites'
import { wildlifeForRegion } from '../../data/wildlife'
import { estimateInterRegionDriveMin, haversineKm } from '../../services/distance'
import { estimateTide } from '../../services/tides'
import { isDogOk } from '../../lib/dogPolicy'
import type { TripCriteria, TripOption, RoadTripStop, ScoreBreakdown } from './types'
import type { ActivityTag } from '../../data/types'

export interface CustomStopInput {
  regionId: string
  nights: number
  campsiteIds: string[]
  activitySiteIds: string[]
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function activitiesFromSelection(stopInputs: CustomStopInput[]): ActivityTag[] {
  const tags = new Set<ActivityTag>()
  for (const stop of stopInputs) {
    if (stop.campsiteIds.length > 0) tags.add('camping')
    for (const siteId of stop.activitySiteIds) {
      const site = activitySites.find((s) => s.id === siteId)
      if (!site) continue
      if (site.type === 'dive') tags.add('scuba-diving')
      if (site.type === 'snorkel') tags.add('snorkelling')
      if (site.type === 'hike') tags.add('hiking')
      if (site.type === 'beach') {
        tags.add('beaches')
        tags.add('swimming')
      }
    }
  }
  return [...tags]
}

export function buildCustomTripOption(
  stopInputsRaw: CustomStopInput[],
  startDate: string,
  groupSize: number,
  bringingDog: boolean,
): { option: TripOption; criteria: TripCriteria } | null {
  const stopInputs = stopInputsRaw.filter(
    (s) => s.nights > 0 && (s.campsiteIds.length > 0 || s.activitySiteIds.length > 0) && findRegion(s.regionId),
  )
  if (stopInputs.length === 0) return null

  const totalNights = stopInputs.reduce((sum, s) => sum + s.nights, 0)
  const endDate = addDaysIso(startDate, totalNights)

  const stops: RoadTripStop[] = []
  const warnings: string[] = []
  const concessions: string[] = []
  let prevPoint: { lat: number; lng: number } = PERTH

  for (const input of stopInputs) {
    const region = findRegion(input.regionId)!
    const legDriveTimeMin =
      stops.length === 0 ? region.driveTimeFromPerthMin : estimateInterRegionDriveMin(prevPoint, region)
    const legDriveDistanceKm =
      stops.length === 0 ? region.driveDistanceFromPerthKm : Math.round(haversineKm(prevPoint, region) * 1.15)

    stops.push({
      regionId: input.regionId,
      nights: input.nights,
      campsiteIds: input.campsiteIds,
      activitySiteIds: input.activitySiteIds,
      legDriveTimeMin,
      legDriveDistanceKm,
    })
    prevPoint = region

    if (region.parkPassRequired) {
      warnings.push(`${region.name} includes a DBCA national park — a Park Pass or day-entry fee applies (exploreparks.dbca.wa.gov.au).`)
    }

    if (bringingDog) {
      const selectedCampsites = campsites.filter((c) => input.campsiteIds.includes(c.id))
      const dogOkCampsites = selectedCampsites.filter((c) => isDogOk(c.dogPolicy))
      if (selectedCampsites.length > 0 && dogOkCampsites.length === 0) {
        concessions.push(`${region.name}: none of your selected campsites confirm dog-friendly access — verify before bringing your dog.`)
      }
      const selectedSites = activitySites.filter((s) => input.activitySiteIds.includes(s.id))
      const dogOkSites = selectedSites.filter((s) => isDogOk(s.dogPolicy))
      if (selectedSites.length > 0 && dogOkSites.length === 0) {
        concessions.push(`${region.name}: none of your selected activity sites allow dogs.`)
      }
    }
  }

  const tide = estimateTide(startDate)
  warnings.push(`Tide: ${tide.label}. ${tide.disclaimer}`)

  const wildlifeIds = new Set<string>()
  const month = new Date(startDate).getMonth() + 1
  for (const input of stopInputs) {
    for (const w of wildlifeForRegion(input.regionId)) {
      if (w.season.monthsPossible.includes(month)) wildlifeIds.add(w.id)
    }
  }

  const allCampsiteIds = stops.flatMap((s) => s.campsiteIds)
  const allActivitySiteIds = stops.flatMap((s) => s.activitySiteIds)
  const dogFriendly =
    !bringingDog ||
    stops.every((s) => {
      const camps = campsites.filter((c) => s.campsiteIds.includes(c.id))
      return camps.length === 0 || camps.some((c) => isDogOk(c.dogPolicy))
    })

  const totalDriveTimeMin = stops.reduce((s, st) => s + st.legDriveTimeMin, 0)
  const totalDriveDistanceKm = stops.reduce((s, st) => s + st.legDriveDistanceKm, 0)

  const breakdown: ScoreBreakdown[] = [
    {
      label: 'Your selections',
      points: Math.min(100, stops.length * 20 + allCampsiteIds.length * 5 + allActivitySiteIds.length * 5),
      maxPoints: 100,
      reason: `${stops.length} stop${stops.length !== 1 ? 's' : ''}, ${allCampsiteIds.length} campsite${allCampsiteIds.length !== 1 ? 's' : ''}, ${allActivitySiteIds.length} activity site${allActivitySiteIds.length !== 1 ? 's' : ''} — built by you`,
    },
  ]
  const score = Math.min(100, breakdown[0].points)

  const regionNames = stopInputs.map((s) => findRegion(s.regionId)!.name.split(' / ')[0].split(' —')[0])

  const option: TripOption = {
    id: `custom-${startDate}-${Date.now()}`,
    regionId: stopInputs[0].regionId,
    title: stops.length > 1 ? `${regionNames.join(' → ')} Custom Trip` : `${regionNames[0]} Custom Trip`,
    nights: totalNights,
    driveTimeMin: totalDriveTimeMin,
    driveDistanceKm: totalDriveDistanceKm,
    score,
    scoreBreakdown: breakdown,
    whySummary: 'Built from the sites you chose yourself.',
    campsiteIds: allCampsiteIds,
    activitySiteIds: allActivitySiteIds,
    wildlifeIds: [...wildlifeIds],
    dogFriendly,
    estimatedBudget: 'flexible',
    warnings,
    concessions,
    stops,
  }

  const criteria: TripCriteria = {
    tripLength: 'road-trip',
    startDate,
    endDate,
    maxDriveHours: 8,
    groupSize,
    bringingDog,
    activities: activitiesFromSelection(stopInputs),
    campingPreference: 'dont-care',
    roadTripStops: stops.length,
  }

  return { option, criteria }
}
