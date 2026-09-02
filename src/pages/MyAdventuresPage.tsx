import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PackingChecklist } from '../features/packing/PackingChecklist'
import { generatePackingList } from '../features/packing/checklist'
import { GearInventory } from '../features/gear/GearInventory'
import { getSavedTrips, deleteTrip, updateTripPackingList } from '../lib/storage'
import { formatDriveTime } from '../services/distance'
import type { SavedTrip } from '../features/trip-builder/types'
import type { ChecklistItem } from '../features/packing/types'

export function MyAdventuresPage() {
  const [tab, setTab] = useState<'trips' | 'gear'>('trips')
  const [trips, setTrips] = useState<SavedTrip[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setTrips(getSavedTrips())
  }, [])

  const handleDelete = (id: string) => {
    deleteTrip(id)
    setTrips(getSavedTrips())
  }

  const handlePackingChange = (trip: SavedTrip, items: ChecklistItem[]) => {
    updateTripPackingList(trip.id, items)
    setTrips((prev) => prev.map((t) => (t.id === trip.id ? { ...t, packingList: items } : t)))
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">My Adventures</h1>
        <p className="text-sm text-ink-500">Saved trips, packing checklists, gear inventory and countdowns.</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('trips')}
          className={clsx(
            'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
            tab === 'trips'
              ? 'border-teal-900 bg-teal-900 text-cream-50'
              : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
          )}
        >
          🗺 Trips
        </button>
        <button
          onClick={() => setTab('gear')}
          className={clsx(
            'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
            tab === 'gear'
              ? 'border-teal-900 bg-teal-900 text-cream-50'
              : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
          )}
        >
          🎒 My Gear
        </button>
      </div>

      {tab === 'gear' && <GearInventory />}

      {tab === 'trips' &&
        (trips.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-ink-500">No saved trips yet — build one in the Plan tab.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => {
              const daysUntil = Math.ceil(
                (new Date(trip.criteria.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              )
              const packingList = trip.packingList ?? generatePackingList(trip.criteria, trip.option)
              const packedCount = packingList.filter((i) => i.checked).length
              const isExpanded = expandedId === trip.id

              return (
                <Card key={trip.id} className="p-5">
                  <h3 className="font-display font-semibold text-ink-900">{trip.option.title}</h3>
                  <p className="mt-1 text-xs text-ink-500">
                    {trip.criteria.startDate} → {trip.criteria.endDate}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge>🚙 {formatDriveTime(trip.option.driveTimeMin)}</Badge>
                    <Badge>⭐ {trip.option.score}</Badge>
                    {daysUntil >= 0 && <Badge tone="accent">{daysUntil} days to go</Badge>}
                    <Badge tone={packedCount === packingList.length ? 'good' : 'neutral'}>
                      🎒 {packedCount}/{packingList.length} packed
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : trip.id)}>
                      {isExpanded ? 'Hide checklist' : 'Packing checklist'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(trip.id)}>
                      Remove
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4">
                      <PackingChecklist items={packingList} onChange={(items) => handlePackingChange(trip, items)} />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        ))}
    </div>
  )
}
