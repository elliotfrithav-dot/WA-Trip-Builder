import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { getCurrentLocation, type GeoPoint } from '../../services/geolocation'
import { fetchWeatherForecast, weatherForDate, type DailyWeather } from '../../services/weather'
import { fetchMarineForecast, marineForDate, type DailyMarine } from '../../services/marine'
import { PERTH } from '../../data/regions'
import { todayIso } from '../../lib/dates'

export function WeatherWidget() {
  const [loading, setLoading] = useState(true)
  const [usingGps, setUsingGps] = useState(false)
  const [weather, setWeather] = useState<DailyWeather | null>(null)
  const [marine, setMarine] = useState<DailyMarine | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const gps: GeoPoint | null = await getCurrentLocation()
      const point = gps ?? PERTH
      if (cancelled) return
      setUsingGps(Boolean(gps))
      try {
        const [w, m] = await Promise.all([
          fetchWeatherForecast('current-location', point.lat, point.lng),
          fetchMarineForecast('current-location', point.lat, point.lng),
        ])
        if (cancelled) return
        setWeather(weatherForDate(w, todayIso()) ?? w.days[0] ?? null)
        setMarine(marineForDate(m, todayIso()) ?? m.days[0] ?? null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <Card className="p-5">
        <p className="text-sm text-ink-500">Loading today's conditions…</p>
      </Card>
    )
  }

  if (!weather) {
    return (
      <Card className="p-5">
        <p className="text-sm text-ink-500">Data unavailable — verify current conditions before travelling.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
          {usingGps ? 'Today, near you' : 'Today, Perth'}
        </h3>
        <span className="text-xs text-ink-300">{usingGps ? '📍 Your location' : '📍 Location unavailable'}</span>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <span className="font-display text-4xl font-semibold text-ink-900">{Math.round(weather.tempMaxC)}°</span>
        <span className="mb-1 text-sm text-ink-500">/ {Math.round(weather.tempMinC)}° low</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Rain" value={`${weather.precipitationMm.toFixed(1)}mm`} />
        <Stat label="Wind" value={`${Math.round(weather.windSpeedMaxKmh)}km/h`} />
        <Stat label="UV" value={weather.uvIndexMax.toFixed(0)} />
        <Stat label="Sunset" value={weather.sunset.slice(11, 16)} />
      </div>

      {marine && (
        <div className="mt-4 border-t border-cream-300/70 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-300">Nearest ocean</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Swell" value={`~${marine.swellWaveHeightMaxM.toFixed(1)}m`} />
            <Stat
              label="Water temp"
              value={marine.seaSurfaceTempC !== undefined ? `${marine.seaSurfaceTempC.toFixed(1)}°C` : '—'}
            />
          </div>
        </div>
      )}
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-300">{label}</p>
      <p className="font-medium text-ink-900">{value}</p>
    </div>
  )
}
