// Per-site activity suitability grading, in the spirit of the spec's
// "Marine Conditions Score" — combines live wind/rain (Open-Meteo weather)
// and swell/water-temperature (Open-Meteo marine) into an Excellent/Good/
// Fair/Poor/Unsafe grade for snorkelling or swimming at a specific site,
// plus per-factor detail so the grade is transparent rather than a black box.

import type { DailyWeather, WeatherForecast } from './weather'
import type { DailyMarine, MarineForecast } from './marine'
import type { ActivitySite } from '../data/types'

export type ConditionGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'unsafe'

export const GRADE_LABEL: Record<ConditionGrade, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  unsafe: 'Unsafe',
}

export const GRADE_EMOJI: Record<ConditionGrade, string> = {
  excellent: '🟢',
  good: '🟢',
  fair: '🟡',
  poor: '🟠',
  unsafe: '🔴',
}

const GRADE_SCORE: Record<ConditionGrade, number> = {
  excellent: 100,
  good: 80,
  fair: 55,
  poor: 30,
  unsafe: 5,
}

export interface ConditionFactor {
  label: string
  grade: ConditionGrade
  detail: string
}

export interface SiteConditionsResult {
  date: string
  score: number // 0-100
  grade: ConditionGrade
  factors: ConditionFactor[]
  dataComplete: boolean
}

function gradeWind(speedKmh: number, gustsKmh: number): ConditionFactor {
  const g = Math.max(speedKmh, gustsKmh * 0.85)
  let grade: ConditionGrade
  if (g < 15) grade = 'excellent'
  else if (g < 22) grade = 'good'
  else if (g < 30) grade = 'fair'
  else if (g < 40) grade = 'poor'
  else grade = 'unsafe'
  return { label: 'Wind', grade, detail: `${Math.round(speedKmh)}km/h, gusts to ${Math.round(gustsKmh)}km/h` }
}

function gradeSwell(swellM: number | undefined): ConditionFactor {
  if (swellM === undefined) {
    return { label: 'Swell', grade: 'fair', detail: 'Not available for this location — sheltered/shore site' }
  }
  let grade: ConditionGrade
  if (swellM < 0.5) grade = 'excellent'
  else if (swellM < 0.8) grade = 'good'
  else if (swellM < 1.2) grade = 'fair'
  else if (swellM < 1.8) grade = 'poor'
  else grade = 'unsafe'
  return { label: 'Swell', grade, detail: `~${swellM.toFixed(1)}m` }
}

function gradeRain(mm: number): ConditionFactor {
  let grade: ConditionGrade
  if (mm < 0.5) grade = 'excellent'
  else if (mm < 2) grade = 'good'
  else if (mm < 5) grade = 'fair'
  else if (mm < 10) grade = 'poor'
  else grade = 'unsafe'
  return { label: 'Rain / visibility', grade, detail: `${mm.toFixed(1)}mm forecast` }
}

function gradeWaterTemp(tempC: number | undefined): ConditionFactor {
  if (tempC === undefined) {
    return { label: 'Water temperature', grade: 'fair', detail: 'Not available for this location' }
  }
  let grade: ConditionGrade
  if (tempC >= 21) grade = 'excellent'
  else if (tempC >= 18) grade = 'good'
  else if (tempC >= 16) grade = 'fair'
  else if (tempC >= 14) grade = 'poor'
  else grade = 'unsafe'
  return { label: 'Water temperature', grade, detail: `${tempC.toFixed(1)}°C` }
}

function gradeWindDirection(
  directionDeg: number,
  bestWindDirection: string | undefined,
): ConditionFactor | null {
  if (!bestWindDirection) return null
  // Only handles the common case used in this seed data: a preference for a
  // light easterly (offshore) wind. Not a general compass-direction parser.
  const mentionsEasterly = /easterly/i.test(bestWindDirection)
  if (!mentionsEasterly) return null
  const isEasterly = directionDeg >= 45 && directionDeg <= 135
  return {
    label: 'Wind direction',
    grade: isEasterly ? 'excellent' : 'fair',
    detail: isEasterly ? 'Offshore (easterly) — clean, clear water' : 'Not offshore — may reduce visibility',
  }
}

export function gradeSiteConditions(
  site: Pick<ActivitySite, 'bestWindDirection'>,
  weather: DailyWeather | undefined,
  marine: DailyMarine | undefined,
): SiteConditionsResult {
  if (!weather) {
    return {
      date: '',
      score: 0,
      grade: 'fair',
      factors: [],
      dataComplete: false,
    }
  }

  const factors: ConditionFactor[] = [
    gradeWind(weather.windSpeedMaxKmh, weather.windGustsMaxKmh),
    gradeSwell(marine?.swellWaveHeightMaxM),
    gradeRain(weather.precipitationMm),
    gradeWaterTemp(marine?.seaSurfaceTempC),
  ]
  const windDirFactor = gradeWindDirection(weather.windDirectionDeg, site.bestWindDirection)
  if (windDirFactor) factors.push(windDirFactor)

  const avgScore = factors.reduce((s, f) => s + GRADE_SCORE[f.grade], 0) / factors.length
  const anyUnsafe = factors.some((f) => f.grade === 'unsafe')
  const score = Math.round(avgScore)

  let grade: ConditionGrade
  if (anyUnsafe) grade = 'poor'
  else if (score >= 85) grade = 'excellent'
  else if (score >= 70) grade = 'good'
  else if (score >= 50) grade = 'fair'
  else if (score >= 30) grade = 'poor'
  else grade = 'unsafe'

  return { date: weather.date, score, grade, factors, dataComplete: Boolean(marine) }
}

/**
 * Grades every day both forecasts cover and returns them best-first — the
 * basis for "what's the best day to go" recommendations. Marine data
 * (~8 days) is the limiting range; weather alone goes further but swell/
 * water-temp would be missing beyond that, so we cap to what marine covers.
 */
export function findBestDays(
  site: Pick<ActivitySite, 'bestWindDirection'>,
  weatherForecast: WeatherForecast,
  marineForecast: MarineForecast,
): SiteConditionsResult[] {
  const marineByDate = new Map<string, DailyMarine>(marineForecast.days.map((d) => [d.date, d]))
  const dates = marineForecast.unavailable
    ? weatherForecast.days.map((d) => d.date)
    : marineForecast.days.map((d) => d.date)

  const results = dates.map((date) => {
    const weather = weatherForecast.days.find((d) => d.date === date)
    const marine = marineByDate.get(date)
    return gradeSiteConditions(site, weather, marine)
  })

  return results.filter((r) => r.dataComplete || marineForecast.unavailable).sort((a, b) => b.score - a.score)
}
