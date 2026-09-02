import { Button } from '../../components/ui/Button'
import { formatDriveTime } from '../../services/distance'
import type { TripOption } from './types'

interface TripComparisonProps {
  options: TripOption[]
  onBuild: (option: TripOption) => void
}

export function TripComparison({ options, onBuild }: TripComparisonProps) {
  if (options.length < 2) return null

  const rows: { label: string; render: (o: TripOption) => React.ReactNode }[] = [
    { label: 'Drive', render: (o) => formatDriveTime(o.driveTimeMin) },
    { label: 'Nights', render: (o) => o.nights },
    { label: 'Camping', render: (o) => (o.campsiteIds.length > 0 ? '✓' : '—') },
    { label: 'Dog friendly', render: (o) => (o.dogFriendly ? '✓' : '✕') },
    { label: 'Activity sites', render: (o) => o.activitySiteIds.length },
    { label: 'Wildlife', render: (o) => (o.wildlifeIds.length > 0 ? '✓' : '—') },
    { label: 'Adventure Score', render: (o) => <strong>{o.score}</strong> },
  ]

  return (
    <div className="overflow-x-auto rounded-2xl border border-cream-300/70 bg-cream-50">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-cream-300/70">
            <th className="p-3 text-left font-medium text-ink-500"></th>
            {options.map((o) => (
              <th key={o.id} className="p-3 text-left font-display font-semibold text-ink-900">
                {o.title.split(' — ')[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-cream-300/40 last:border-0">
              <td className="p-3 font-medium text-ink-500">{row.label}</td>
              {options.map((o) => (
                <td key={o.id} className="p-3 text-ink-700">
                  {row.render(o)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="p-3"></td>
            {options.map((o) => (
              <td key={o.id} className="p-3">
                <Button size="sm" variant="secondary" onClick={() => onBuild(o)}>
                  Build this trip
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
