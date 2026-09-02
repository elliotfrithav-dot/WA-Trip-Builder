// Live marine/swell conditions via Open-Meteo Marine Weather API (free, no
// key): https://open-meteo.com/en/docs/marine-weather-api

export interface DailyMarine {
  date: string
  waveHeightMaxM: number
  wavePeriodMaxS: number
  swellWaveHeightMaxM: number
  swellWavePeriodMaxS: number
  seaSurfaceTempC?: number
}

export interface MarineForecast {
  regionId: string
  fetchedAt: string
  days: DailyMarine[]
  /** true if this region's coordinates returned no marine data (e.g. inland-ish point) */
  unavailable?: boolean
}

const cache = new Map<string, { fetchedAt: number; data: MarineForecast }>()
const CACHE_TTL_MS = 30 * 60 * 1000

export async function fetchMarineForecast(
  regionId: string,
  lat: number,
  lng: number,
): Promise<MarineForecast> {
  const cached = cache.get(regionId)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.data

  const url = new URL('https://marine-api.open-meteo.com/v1/marine')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set(
    'daily',
    ['wave_height_max', 'wave_period_max', 'swell_wave_height_max', 'swell_wave_period_max'].join(','),
  )
  url.searchParams.set('hourly', 'sea_surface_temperature')
  url.searchParams.set('timezone', 'Australia/Perth')
  url.searchParams.set('forecast_days', '8')

  let data: MarineForecast
  try {
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Open-Meteo marine request failed: ${res.status}`)
    const json = await res.json()

    if (!json.daily?.time) {
      data = { regionId, fetchedAt: new Date().toISOString(), days: [], unavailable: true }
    } else {
      // Sea surface temp comes hourly; take the midday reading for each date.
      const sstByDate = new Map<string, number>()
      if (json.hourly?.time) {
        for (let i = 0; i < json.hourly.time.length; i++) {
          const t: string = json.hourly.time[i]
          if (t.endsWith('T12:00')) sstByDate.set(t.slice(0, 10), json.hourly.sea_surface_temperature[i])
        }
      }

      const days: DailyMarine[] = json.daily.time.map((date: string, i: number) => ({
        date,
        waveHeightMaxM: json.daily.wave_height_max[i],
        wavePeriodMaxS: json.daily.wave_period_max[i],
        swellWaveHeightMaxM: json.daily.swell_wave_height_max[i],
        swellWavePeriodMaxS: json.daily.swell_wave_period_max[i],
        seaSurfaceTempC: sstByDate.get(date),
      }))
      data = { regionId, fetchedAt: new Date().toISOString(), days }
    }
  } catch {
    data = { regionId, fetchedAt: new Date().toISOString(), days: [], unavailable: true }
  }

  cache.set(regionId, { fetchedAt: Date.now(), data })
  return data
}

export function marineForDate(forecast: MarineForecast, isoDate: string): DailyMarine | undefined {
  return forecast.days.find((d) => d.date === isoDate)
}
