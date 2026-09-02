import { Card } from './ui/Card'
import { EMERGENCY_CONTACTS } from '../data/emergency'
import type { Region } from '../data/types'

interface SafetyCardProps {
  regions: Region[]
}

export function SafetyCard({ regions }: SafetyCardProps) {
  const core = EMERGENCY_CONTACTS.slice(0, 2) // 000 + marine emergency, always relevant

  return (
    <Card className="border-terracotta-500/30 bg-terracotta-500/5 p-5">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-terracotta-600">
        🚨 Safety &amp; nearest services
      </h3>

      <dl className="mt-3 space-y-1.5">
        {core.map((c) => (
          <div key={c.name} className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="text-ink-700">{c.name}</dt>
            <dd className="shrink-0 font-mono font-semibold text-terracotta-600">{c.number}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 space-y-2 border-t border-terracotta-500/20 pt-3">
        {regions.map((r) => (
          <div key={r.id} className="text-xs text-ink-600">
            <span className="font-medium text-ink-900">{r.name}: </span>
            Nearest fuel — {r.nearestFuelTown ?? 'unconfirmed'}. Nearest medical — {r.nearestMedicalTown ?? 'unconfirmed'}.
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-terracotta-600">
        General guidance, not verified against a live directory — confirm before remote travel, especially with
        patchy mobile reception.
      </p>
    </Card>
  )
}
