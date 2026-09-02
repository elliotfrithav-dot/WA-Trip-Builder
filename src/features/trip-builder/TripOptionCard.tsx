import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ScoreRing } from '../../components/ui/ScoreRing'
import { formatDriveTime } from '../../services/distance'
import { GRADE_LABEL, GRADE_EMOJI } from '../../services/siteConditions'
import { findRegion } from '../../data/regions'
import type { TripOption } from './types'

function formatDayLabel(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}

interface TripOptionCardProps {
  option: TripOption
  rank: number
  onBuild: (option: TripOption) => void
}

export function TripOptionCard({ option, rank, onBuild }: TripOptionCardProps) {
  const [showWhy, setShowWhy] = useState(false)

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-300">Option {rank}</div>
          <h3 className="font-display text-lg font-semibold text-ink-900">{option.title}</h3>
          <p className="text-sm text-ink-500">
            {option.nights === 0 ? 'Day trip' : `${option.nights} night${option.nights !== 1 ? 's' : ''}`}
          </p>
        </div>
        <ScoreRing score={option.score} />
      </div>

      {option.stops && option.stops.length > 0 && (
        <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-ink-700">
          {option.stops.map((s, i) => (
            <li key={s.regionId} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-ink-300">→</span>}
              <span className="rounded-full bg-cream-200 px-2.5 py-1">
                {findRegion(s.regionId)?.name.split(' / ')[0] ?? s.regionId} · {s.nights}n
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>🚙 {formatDriveTime(option.driveTimeMin)} drive</Badge>
        {option.campsiteIds.length > 0 && <Badge>🏕 Camping</Badge>}
        {option.dogFriendly && <Badge tone="good">🐕 Dog friendly</Badge>}
        {option.activitySiteIds.length > 0 && <Badge>🤿 {option.activitySiteIds.length} activity sites</Badge>}
        {option.wildlifeIds.length > 0 && <Badge tone="accent">🐋 Wildlife potential</Badge>}
        {option.conditionsGrade && (
          <Badge tone={option.conditionsGrade.grade === 'excellent' || option.conditionsGrade.grade === 'good' ? 'good' : 'warn'}>
            {GRADE_EMOJI[option.conditionsGrade.grade]} Conditions: {GRADE_LABEL[option.conditionsGrade.grade]}
          </Badge>
        )}
      </div>

      {option.concessions.length > 0 && (
        <div className="mt-3 rounded-xl border border-terracotta-400/30 bg-terracotta-400/5 px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-600">Doesn't fully match your criteria</p>
          <ul className="mt-1 space-y-1">
            {option.concessions.map((c, i) => (
              <li key={i} className="text-xs text-ink-700">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {option.bestDayRecommendation && (
        <div className="mt-3 rounded-xl bg-ocean-500/10 px-4 py-2.5 text-sm text-ocean-600">
          💡 Conditions look better on <strong>{formatDayLabel(option.bestDayRecommendation.date)}</strong> (
          {GRADE_LABEL[option.bestDayRecommendation.result.grade]}) than your selected date.
        </div>
      )}

      <button
        onClick={() => setShowWhy((v) => !v)}
        className="mt-4 text-sm font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2"
      >
        {showWhy ? 'Hide score breakdown' : 'Why this score?'}
      </button>

      {showWhy && (
        <div className="mt-3 space-y-2 rounded-xl bg-cream-100 p-4">
          <p className="text-sm text-ink-700">{option.whySummary}</p>
          <ul className="space-y-1.5 text-xs text-ink-500">
            {option.scoreBreakdown.map((b) => (
              <li key={b.label} className="flex justify-between gap-2">
                <span>
                  <strong className="text-ink-700">{b.label}</strong> — {b.reason}
                </span>
                <span className="shrink-0 font-mono">
                  {b.points}/{b.maxPoints}
                </span>
              </li>
            ))}
          </ul>
          {option.warnings.length > 0 && (
            <div className="mt-2 space-y-1 border-t border-cream-300 pt-2">
              {option.warnings.map((w, i) => (
                <p key={i} className="text-xs text-terracotta-600">
                  ⚠️ {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <Button className="mt-4 w-full" variant="secondary" onClick={() => onBuild(option)}>
        Build this trip
      </Button>
    </Card>
  )
}
