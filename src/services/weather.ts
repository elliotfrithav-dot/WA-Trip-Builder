// Live weather via Open-Meteo (free, no API key, no rate limit for
// personal/non-commercial use: https://open-meteo.com). Called directly
// from the browser — CORS-enabled by the provider.

export interface DailyWeather {
  date: string // ISO date
  tempMaxC: number
  tempMinC: number
  precipitationMm: number
  windSpeedMaxKmh: number
  windGustsMaxKmh: number
  windDirectionDeg: number
  uvIndexMax: number
  sunrise: string
  sunset: string
}

export interface WeatherForecast {
  regionId: string
  fetchedAt: string
  days: DailyWeather[]
}

const cache = new Map<string, { fetchedAt: number; data: WeatherForecast }>()
const CACHE_TTL_MS = 30 * 60 * 1000

export async function fetchWeatherForecast(
  regionId: string,
  lat: number,
  lng: number,
): Promise<WeatherForecast> {
  const cached = cache.get(regionId)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.data

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set(
    'daily',
    [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'windspeed_10m_max',
      'windgusts_10m_max',
      'winddirection_10m_dominant',
      'uv_index_max',
      'sunrise',
      'sunset',
    ].join(','),
  )
  url.searchParams.set('timezone', 'Australia/Perth')
  url.searchParams.set('forecast_days', '16')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Open-Meteo weather request failed: ${res.status}`)
  const json = await res.json()

  const days: DailyWeather[] = json.daily.time.map((date: string, i: number) => ({
    date,
    tempMaxC: json.daily.temperature_2m_max[i],
    tempMinC: json.daily.temperature_2m_min[i],
    precipitationMm: json.daily.precipitation_sum[i],
    windSpeedMaxKmh: json.daily.windspeed_10m_max[i],
    windGustsMaxKmh: json.daily.windgusts_10m_max[i],
    windDirectionDeg: json.daily.winddirection_10m_dominant[i],
    uvIndexMax: json.daily.uv_index_max[i],
    sunrise: json.daily.sunrise[i],
    sunset: json.daily.sunset[i],
  }))

  const data: WeatherForecast = { regionId, fetchedAt: new Date().toISOString(), days }
  cache.set(regionId, { fetchedAt: Date.now(), data })
  return data
}

export function weatherForDate(forecast: WeatherForecast, isoDate: string): DailyWeather | undefined {
  return forecast.days.find((d) => d.date === isoDate)
}
