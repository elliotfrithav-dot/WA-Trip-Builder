import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatDriveTime } from '../../services/distance'
import { daysUntil } from '../../lib/dates'
import type { SavedTrip } from '../../features/trip-builder/types'

interface NextAdventureCardProps {
  trip: SavedTrip
}

export function NextAdventureCard({ trip }: NextAdventureCardProps) {
  const packed = trip.packingList?.filter((i) => i.checked).length ?? 0
  const total = trip.packingList?.length ?? 0
  const days = daysUntil(trip.criteria.startDate)

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">Your next adventure</h3>
        <Badge tone="accent">{days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days to go`}</Badge>
      </div>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink-900">{trip.option.title}</h2>
      <p className="text-sm text-ink-500">
        {trip.criteria.startDate} → {trip.criteria.endDate}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge>🚙 {formatDriveTime(trip.option.driveTimeMin)}</Badge>
        <Badge>⭐ {trip.option.score}</Badge>
        {total > 0 && (
          <Badge tone={packed === total ? 'good' : 'neutral'}>
            🎒 {packed}/{total} packed
          </Badge>
        )}
      </div>

      {total > 0 && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream-200">
          <div className="h-full rounded-full bg-teal-700" style={{ width: `${(packed / total) * 100}%` }} />
        </div>
      )}

      <Link to="/my-adventures" className="mt-4 inline-block text-sm font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2">
        View full trip →
      </Link>
    </Card>
  )
}
