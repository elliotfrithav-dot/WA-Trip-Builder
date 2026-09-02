import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { PackingChecklist } from '../packing/PackingChecklist'
import { RouteMap } from '../../components/map/RouteMap'
import { SafetyCard } from '../../components/SafetyCard'
import { findRegion } from '../../data/regions'
import type { ChecklistItem } from '../packing/types'
import type { ItineraryDay, TripOption } from './types'

interface ItineraryViewProps {
  option: TripOption
  itinerary: ItineraryDay[]
  packingList: ChecklistItem[]
  onPackingListChange: (items: ChecklistItem[]) => void
  onSave: () => void
  saved: boolean
}

export function ItineraryView({
  option,
  itinerary,
  packingList,
  onPackingListChange,
  onSave,
  saved,
}: ItineraryViewProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-900">{option.title}</h2>
          <p className="text-sm text-ink-500">
            {option.nights === 0 ? 'Day trip' : `${option.nights} night itinerary`} · Adventure Score {option.score}
          </p>
        </div>
        <Button onClick={onSave} disabled={saved}>
          {saved ? '✓ Saved' : 'SAVE TRIP'}
        </Button>
      </div>

      {(() => {
        if (option.stops && option.stops.length > 0) {
          const stopRegions = option.stops.map((s) => findRegion(s.regionId)).filter((r): r is NonNullable<typeof r> => Boolean(r))
          if (stopRegions.length === 0) return null
          const [first, ...rest] = stopRegions
          return (
            <RouteMap
              destination={{ lat: first.lat, lng: first.lng, name: first.name }}
              waypoints={rest.map((r) => ({ lat: r.lat, lng: r.lng, name: r.name }))}
            />
          )
        }
        const region = findRegion(option.regionId)
        return region ? <RouteMap destination={{ lat: region.lat, lng: region.lng, name: region.name }} /> : null
      })()}

      {itinerary.map((day) => (
        <Card key={day.dayNumber} className="p-5">
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Day {day.dayNumber} — {day.label}
          </h3>
          <ol className="space-y-3">
            {day.stops.map((stop, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-14 shrink-0 font-mono text-sm text-teal-800">{stop.time}</span>
                <div>
                  <p className="text-sm font-medium text-ink-900">{stop.title}</p>
                  {stop.description && <p className="text-xs text-ink-500">{stop.description}</p>}
                  {stop.costAud && <p className="text-xs text-ink-500">💰 {stop.costAud}</p>}
                  {stop.bookingUrl && (
                    <a
                      href={stop.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2"
                    >
                      Book →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      ))}

      {(() => {
        if (option.stops && option.stops.length > 0) {
          const stopRegions = option.stops.map((s) => findRegion(s.regionId)).filter((r): r is NonNullable<typeof r> => Boolean(r))
          return stopRegions.length > 0 ? <SafetyCard regions={stopRegions} /> : null
        }
        const region = findRegion(option.regionId)
        return region ? <SafetyCard regions={[region]} /> : null
      })()}

      {option.concessions.length > 0 && (
        <Card className="border-terracotta-400/30 bg-terracotta-400/5 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-terracotta-600">
            Doesn't fully match your criteria
          </p>
          <ul className="space-y-1 text-xs text-ink-700">
            {option.concessions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Card>
      )}

      <PackingChecklist items={packingList} onChange={onPackingListChange} />

      {option.warnings.length > 0 && (
        <Card className="border-terracotta-500/30 bg-terracotta-500/5 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-terracotta-600">
            Verify before travelling
          </p>
          <ul className="space-y-1 text-xs text-terracotta-600">
            {option.warnings.map((w, i) => (
              <li key={i}>⚠️ {w}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
