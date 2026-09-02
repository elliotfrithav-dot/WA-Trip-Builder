import { findRegion } from '../../data/regions'
import { campsites } from '../../data/campsites'
import { activitySites, activitySitesForRegion } from '../../data/activitySites'
import { wildlifeSpecies, wildlifeForRegion } from '../../data/wildlife'
import { fetchWeatherForecast, weatherForDate } from '../../services/weather'
import { formatDriveTime } from '../../services/distance'
import { GRADE_LABEL } from '../../services/siteConditions'
import type { TripCriteria, TripOption, ItineraryDay, RoadTripStop } from './types'
import type { ActivitySite, Region, WildlifeSpecies } from '../../data/types'

const DAY_LABELS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function generateItinerary(option: TripOption, criteria: TripCriteria): Promise<ItineraryDay[]> {
  if (criteria.tripLength === 'road-trip' && option.stops) {
    return buildRoadTripItinerary(option, criteria, option.stops)
  }

  const region = findRegion(option.regionId)
  if (!region) return []

  const campsite = campsites.find((c) => option.campsiteIds.includes(c.id))
  const waterSites = activitySites.filter(
    (s) => option.activitySiteIds.includes(s.id) && (s.type === 'snorkel' || s.type === 'dive'),
  )
  const hikeSites = activitySites.filter((s) => option.activitySiteIds.includes(s.id) && s.type === 'hike')
  const beachSites = activitySites.filter((s) => option.activitySiteIds.includes(s.id) && s.type === 'beach')
  const wildlifeList = wildlifeSpecies.filter((w) => option.wildlifeIds.includes(w.id))

  // One distinct "morning activity" block per middle day, cycling through
  // whatever's actually available in this region rather than repeating the
  // same site every day.
  const morningBlocks = [...waterSites, ...hikeSites, ...beachSites]

  let sunrise = '07:00'
  let sunset = '18:00'
  try {
    const forecast = await fetchWeatherForecast(region.id, region.lat, region.lng)
    const day = weatherForDate(forecast, criteria.startDate)
    if (day) {
      sunrise = day.sunrise.slice(11, 16)
      sunset = day.sunset.slice(11, 16)
    }
  } catch {
    // fall back to defaults set above
  }

  if (criteria.tripLength === 'day-trip') {
    return buildDayTripItinerary(option, criteria, region, [...waterSites, ...hikeSites, ...beachSites], sunrise, sunset)
  }

  const days: ItineraryDay[] = []
  const nights = option.nights
  const totalDays = nights + 1

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(criteria.startDate, i)
    const dayOfWeek = DAY_LABELS[new Date(`${date}T12:00:00`).getDay()]
    const stops: ItineraryDay['stops'] = []

    if (i === 0) {
      stops.push({
        time: '15:30',
        title: 'Leave Perth',
        description: `Estimated drive: ${formatDriveTime(region.driveTimeFromPerthMin)} (${region.driveDistanceFromPerthKm}km)`,
      })
      stops.push({
        time: minutesLater('15:30', region.driveTimeFromPerthMin),
        title: campsite ? `Arrive at ${campsite.name}` : `Arrive in ${region.name}`,
        description: campsite ? 'Set up camp.' : undefined,
        costAud: campsite?.feesAud,
        bookingUrl: campsite?.bookingUrl,
      })
      stops.push({ time: sunset, title: 'Sunset', description: 'Good time for a beach walk or scenic lookout.' })
    } else if (i === totalDays - 1) {
      stops.push({ time: sunrise, title: 'Sunrise' })
      stops.push({ time: '10:00', title: 'Pack up camp' })
      stops.push({
        time: '11:00',
        title: 'Depart for Perth',
        description: `Estimated drive: ${formatDriveTime(region.driveTimeFromPerthMin)}`,
      })
    } else {
      stops.push(...buildMiddleDayStops(i - 1, morningBlocks, wildlifeList, sunrise, sunset))
    }

    days.push({ dayNumber: i + 1, date, label: dayOfWeek, stops })
  }

  return days
}

function buildMiddleDayStops(
  middleDayIndex: number,
  morningBlocks: ActivitySite[],
  wildlifeList: WildlifeSpecies[],
  sunrise: string,
  sunset: string,
): ItineraryDay['stops'] {
  const stops: ItineraryDay['stops'] = [{ time: sunrise, title: 'Sunrise' }]

  if (morningBlocks.length > 0) {
    const block = morningBlocks[middleDayIndex % morningBlocks.length]
    stops.push({
      time: '08:00',
      title: `${activityVerb(block.type)} — ${block.name}`,
      description: block.notes,
      costAud: block.costAud,
      bookingUrl: block.bookingUrl,
    })
  } else {
    stops.push({
      time: '09:00',
      title: 'Free morning',
      description: 'No specific site matched for this region yet — relax at camp or explore locally.',
    })
  }

  stops.push({ time: '12:00', title: 'Lunch' })

  const afternoonBlock = morningBlocks.length > 1 ? morningBlocks[(middleDayIndex + 1) % morningBlocks.length] : undefined
  if (afternoonBlock) {
    stops.push({
      time: '14:00',
      title: `${activityVerb(afternoonBlock.type)} — ${afternoonBlock.name}`,
      description: afternoonBlock.notes,
      costAud: afternoonBlock.costAud,
      bookingUrl: afternoonBlock.bookingUrl,
    })
  } else {
    stops.push({ time: '14:00', title: 'Scenic drive / rest', description: 'Explore the local area at an easy pace.' })
  }

  if (wildlifeList.length > 0) {
    const w = wildlifeList[middleDayIndex % wildlifeList.length]
    stops.push({ time: '17:00', title: `Wildlife watch — ${w.emoji} ${w.commonName}`, description: w.behaviour })
  }
  stops.push({ time: sunset, title: 'Sunset' })

  return stops
}

async function buildRoadTripItinerary(
  option: TripOption,
  criteria: TripCriteria,
  routeStops: RoadTripStop[],
): Promise<ItineraryDay[]> {
  const days: ItineraryDay[] = []
  let dayCursor = 0
  let prevRegionName = 'Perth'

  for (let stopIndex = 0; stopIndex < routeStops.length; stopIndex++) {
    const stop = routeStops[stopIndex]
    const region = findRegion(stop.regionId)
    if (!region) continue

    const campsite = campsites.find((c) => stop.campsiteIds.includes(c.id))
    const sites = activitySitesForRegion(region.id)
    const waterSites = sites.filter((s) => s.type === 'snorkel' || s.type === 'dive')
    const hikeSites = sites.filter((s) => s.type === 'hike')
    const beachSites = sites.filter((s) => s.type === 'beach')
    const morningBlocks = [...waterSites, ...hikeSites, ...beachSites]
    const wildlifeList = wildlifeSpecies.filter(
      (w) => option.wildlifeIds.includes(w.id) && wildlifeForRegion(region.id).some((r) => r.id === w.id),
    )

    let sunrise = '07:00'
    let sunset = '18:00'
    try {
      const forecast = await fetchWeatherForecast(region.id, region.lat, region.lng)
      const day = weatherForDate(forecast, addDays(criteria.startDate, dayCursor))
      if (day) {
        sunrise = day.sunrise.slice(11, 16)
        sunset = day.sunset.slice(11, 16)
      }
    } catch {
      // fall back to defaults
    }

    const isFirstStop = stopIndex === 0
    const isLastStop = stopIndex === routeStops.length - 1

    // --- Arrival day (day 1 overall, or the transition day from the previous stop) ---
    const arrivalStops: ItineraryDay['stops'] = [
      {
        time: '09:00',
        title: isFirstStop ? 'Leave Perth' : `Depart ${prevRegionName}`,
        description: `Estimated drive: ${formatDriveTime(stop.legDriveTimeMin)} (${Math.round(stop.legDriveDistanceKm)}km)`,
      },
      {
        time: minutesLater('09:00', stop.legDriveTimeMin),
        title: campsite ? `Arrive at ${campsite.name}` : `Arrive in ${region.name}`,
        description: campsite ? 'Set up camp.' : undefined,
        costAud: campsite?.feesAud,
        bookingUrl: campsite?.bookingUrl,
      },
      { time: sunset, title: 'Sunset', description: 'Good time for a beach walk or scenic lookout.' },
    ]
    days.push({
      dayNumber: dayCursor + 1,
      date: addDays(criteria.startDate, dayCursor),
      label: DAY_LABELS[new Date(`${addDays(criteria.startDate, dayCursor)}T12:00:00`).getDay()],
      stops: arrivalStops,
    })
    dayCursor++

    // --- Full middle days at this stop ---
    for (let m = 0; m < stop.nights - 1; m++) {
      const date = addDays(criteria.startDate, dayCursor)
      days.push({
        dayNumber: dayCursor + 1,
        date,
        label: DAY_LABELS[new Date(`${date}T12:00:00`).getDay()],
        stops: buildMiddleDayStops(m, morningBlocks, wildlifeList, sunrise, sunset),
      })
      dayCursor++
    }

    // --- Departure, only on the very last stop (earlier stops flow straight into the next arrival day) ---
    if (isLastStop) {
      const finalRegion = findRegion(routeStops[routeStops.length - 1].regionId)
      const returnDriveMin = finalRegion?.driveTimeFromPerthMin ?? stop.legDriveTimeMin
      const date = addDays(criteria.startDate, dayCursor)
      days.push({
        dayNumber: dayCursor + 1,
        date,
        label: DAY_LABELS[new Date(`${date}T12:00:00`).getDay()],
        stops: [
          { time: sunrise, title: 'Sunrise' },
          { time: '10:00', title: 'Pack up camp' },
          { time: '11:00', title: 'Depart for Perth', description: `Estimated drive: ${formatDriveTime(returnDriveMin)}` },
        ],
      })
      dayCursor++
    }

    prevRegionName = region.name
  }

  return days
}

function buildDayTripItinerary(
  option: TripOption,
  criteria: TripCriteria,
  region: Region,
  blocks: ActivitySite[],
  sunrise: string,
  sunset: string,
): ItineraryDay[] {
  const dayOfWeek = DAY_LABELS[new Date(`${criteria.startDate}T12:00:00`).getDay()]
  const stops: ItineraryDay['stops'] = []

  const departTime = '08:00'
  const arriveTime = minutesLater(departTime, region.driveTimeFromPerthMin)
  const primary = blocks[0]
  const secondary = blocks[1]

  stops.push({
    time: departTime,
    title: 'Leave Perth',
    description: `Estimated drive: ${formatDriveTime(region.driveTimeFromPerthMin)} (${region.driveDistanceFromPerthKm}km)`,
  })
  stops.push({ time: arriveTime, title: primary ? `Arrive at ${primary.name}` : `Arrive in ${region.name}` })

  if (primary) {
    const conditionsNote = option.conditionsGrade
      ? `Conditions today: ${GRADE_LABEL[option.conditionsGrade.grade]}. ${primary.notes ?? ''}`.trim()
      : primary.notes
    stops.push({
      time: minutesLater(arriveTime, 10),
      title: `${activityVerb(primary.type)} — ${primary.name}`,
      description: conditionsNote,
      costAud: primary.costAud,
      bookingUrl: primary.bookingUrl,
    })
  }

  stops.push({ time: '12:30', title: 'Lunch' })

  if (secondary) {
    stops.push({
      time: '13:30',
      title: `${activityVerb(secondary.type)} — ${secondary.name}`,
      description: secondary.notes,
      costAud: secondary.costAud,
      bookingUrl: secondary.bookingUrl,
    })
  } else if (primary) {
    stops.push({
      time: '13:30',
      title: 'Second session or relax',
      description: `Another swim/snorkel at ${primary.name}, or relax nearby before the drive home.`,
    })
  }

  const departHomeTime = '15:30'
  stops.push({
    time: departHomeTime,
    title: 'Depart for home',
    description: `Estimated drive: ${formatDriveTime(region.driveTimeFromPerthMin)}`,
  })
  stops.push({ time: minutesLater(departHomeTime, region.driveTimeFromPerthMin), title: 'Arrive home' })

  if (sunset < departHomeTime) {
    stops.push({ time: sunset, title: 'Sunset (before you leave)', description: 'Consider heading back before dark.' })
    stops.sort((a, b) => a.time.localeCompare(b.time))
  } else {
    void sunrise // sunrise not otherwise used for a mid-morning-start day trip
  }

  return [{ dayNumber: 1, date: criteria.startDate, label: dayOfWeek, stops }]
}

function activityVerb(type: 'dive' | 'snorkel' | 'hike' | 'beach'): string {
  switch (type) {
    case 'dive':
      return 'Dive'
    case 'snorkel':
      return 'Snorkel'
    case 'hike':
      return 'Hike'
    case 'beach':
      return 'Beach'
  }
}

function minutesLater(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + Math.round(minutes)
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
