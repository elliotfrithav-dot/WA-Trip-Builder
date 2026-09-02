import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { WeatherWidget } from '../features/dashboard/WeatherWidget'
import { NextAdventureCard } from '../features/dashboard/NextAdventureCard'
import { getSavedTrips } from '../lib/storage'
import { wildlifeForMonth } from '../data/wildlife'
import { todayIso } from '../lib/dates'
import type { SavedTrip } from '../features/trip-builder/types'

export function DashboardPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([])

  useEffect(() => {
    setTrips(getSavedTrips())
  }, [])

  const upcoming = trips
    .filter((t) => t.criteria.startDate >= todayIso())
    .sort((a, b) => a.criteria.startDate.localeCompare(b.criteria.startDate))[0]

  const month = new Date().getMonth() + 1
  const inSeason = wildlifeForMonth(month).slice(0, 4)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Your Next Adventure</h1>
        <p className="text-sm text-ink-500">
          Based on your preferences, weather and current conditions — here's what's happening now.
        </p>
      </div>

      <WeatherWidget />

      {upcoming ? (
        <NextAdventureCard trip={upcoming} />
      ) : (
        <Card className="p-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            No upcoming trips saved
          </h3>
          <p className="mt-1 text-sm text-ink-500">Build a trip and it'll show up here with a countdown.</p>
          <Link to="/plan">
            <Button className="mt-3" size="sm">
              Plan a trip
            </Button>
          </Link>
        </Card>
      )}

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            In season this month
          </h3>
          <Link to="/plan?tab=wildlife" className="text-xs font-medium text-teal-800">
            Full calendar →
          </Link>
        </div>
        {inSeason.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing standout this month in the seed wildlife data.</p>
        ) : (
          <ul className="space-y-2">
            {inSeason.map((w) => (
              <li key={w.id} className="flex items-center gap-2 text-sm">
                <span className="text-lg">{w.emoji}</span>
                <span className="font-medium text-ink-900">{w.commonName}</span>
                <span className="text-ink-500">
                  — {w.season.monthsPeak.includes(month) ? 'peak season' : 'possible'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/explore">
          <Card className="p-4 text-center transition-shadow hover:shadow-md">
            <div className="text-2xl">🗺️</div>
            <p className="mt-1 text-sm font-medium text-ink-900">Explore</p>
          </Card>
        </Link>
        <Link to="/my-adventures">
          <Card className="p-4 text-center transition-shadow hover:shadow-md">
            <div className="text-2xl">🎒</div>
            <p className="mt-1 text-sm font-medium text-ink-900">
              My Adventures {trips.length > 0 && `(${trips.length})`}
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
