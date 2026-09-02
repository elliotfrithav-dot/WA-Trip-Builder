import { useState } from 'react'
import clsx from 'clsx'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ACTIVITY_META, CAMPING_LABELS } from '../../data/activityMeta'
import type { ActivityTag, CampingType, ComfortLevel, BudgetLevel } from '../../data/types'
import type { DriveLimitHours, TripCriteria, TripLength } from './types'

const DRIVE_OPTIONS: DriveLimitHours[] = [1, 2, 3, 4, 5, 6, 8]
const GROUP_OPTIONS = [
  { value: 1, label: 'Solo', icon: '👤' },
  { value: 2, label: '2', icon: '👥' },
  { value: 3, label: '3', icon: '👥' },
  { value: 4, label: '4', icon: '👥' },
  { value: 5, label: '5+', icon: '👥' },
]
const CAMPING_OPTIONS: (CampingType | 'dont-care' | 'no-camping')[] = [
  'caravan-campground',
  'basic-campground',
  'remote-camping',
  'legal-secluded-camping',
  'beach-camping',
  'four-wd-access-camping',
  'dont-care',
  'no-camping',
]
const COMFORT_OPTIONS: { value: ComfortLevel; label: string }[] = [
  { value: 'easy', label: 'Easy / comfortable' },
  { value: 'moderate', label: 'Moderate adventure' },
  { value: 'remote', label: 'Remote / basic' },
  { value: 'hardcore', label: 'Hardcore adventure' },
]
const BUDGET_OPTIONS: { value: BudgetLevel; label: string }[] = [
  { value: 'free', label: 'Free / very cheap' },
  { value: 'budget', label: 'Budget' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'flexible', label: "Don't care" },
]

function defaultDates() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() + ((5 - start.getDay() + 7) % 7 || 7)) // next Friday
  const end = new Date(start)
  end.setDate(end.getDate() + 3)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

interface TripBuilderFormProps {
  onSubmit: (criteria: TripCriteria) => void
  loading?: boolean
}

export function TripBuilderForm({ onSubmit, loading }: TripBuilderFormProps) {
  const defaults = defaultDates()
  const [tripLength, setTripLength] = useState<TripLength>('multi-day')
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [maxDriveHours, setMaxDriveHours] = useState<DriveLimitHours>(3)
  const [groupSize, setGroupSize] = useState(1)
  const [bringingDog, setBringingDog] = useState(false)
  const [activities, setActivities] = useState<ActivityTag[]>([])
  const [campingPreference, setCampingPreference] = useState<CampingType | 'dont-care' | 'no-camping'>('dont-care')
  const [comfortLevel, setComfortLevel] = useState<ComfortLevel | undefined>()
  const [budget, setBudget] = useState<BudgetLevel | undefined>()
  const [findBestDay, setFindBestDay] = useState(true)
  const [roadTripStops, setRoadTripStops] = useState(3)

  const toggleActivity = (tag: ActivityTag) => {
    setActivities((prev) => (prev.includes(tag) ? prev.filter((a) => a !== tag) : [...prev, tag]))
  }

  const nights = Math.max(
    1,
    Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)),
  )

  const submit = () => {
    onSubmit({
      tripLength,
      startDate,
      endDate: tripLength === 'day-trip' ? startDate : endDate,
      maxDriveHours,
      groupSize,
      bringingDog,
      activities,
      campingPreference: tripLength === 'day-trip' ? 'no-camping' : campingPreference,
      comfortLevel,
      budget,
      findBestDay: tripLength === 'day-trip' ? findBestDay : undefined,
      roadTripStops: tripLength === 'road-trip' ? roadTripStops : undefined,
    })
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">Trip length</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => setTripLength('day-trip')}
            className={clsx(
              'flex-1 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              tripLength === 'day-trip'
                ? 'border-teal-900 bg-teal-900 text-cream-50'
                : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
            )}
          >
            ☀️ Day trip
            <span className={clsx('mt-0.5 block text-xs font-normal', tripLength === 'day-trip' ? 'text-cream-200' : 'text-ink-500')}>
              Snorkel, swim, or a hike — home by evening
            </span>
          </button>
          <button
            onClick={() => setTripLength('multi-day')}
            className={clsx(
              'flex-1 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              tripLength === 'multi-day'
                ? 'border-teal-900 bg-teal-900 text-cream-50'
                : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
            )}
          >
            🏕 Multi-day
            <span className={clsx('mt-0.5 block text-xs font-normal', tripLength === 'multi-day' ? 'text-cream-200' : 'text-ink-500')}>
              One base, camping / overnight
            </span>
          </button>
          <button
            onClick={() => setTripLength('road-trip')}
            className={clsx(
              'flex-1 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              tripLength === 'road-trip'
                ? 'border-teal-900 bg-teal-900 text-cream-50'
                : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
            )}
          >
            🚐 Road trip
            <span className={clsx('mt-0.5 block text-xs font-normal', tripLength === 'road-trip' ? 'text-cream-200' : 'text-ink-500')}>
              Multiple stops along the coast
            </span>
          </button>
        </div>
      </Card>

      {tripLength === 'road-trip' && (
        <Card className="p-5">
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            How many stops?
          </h3>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setRoadTripStops(n)}
                className={clsx(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  roadTripStops === n
                    ? 'border-teal-900 bg-teal-900 text-cream-50'
                    : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
                )}
              >
                {n} stops
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-500">
            We'll pick a sensible route north or south of Perth and split your nights across the stops.
          </p>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
          {tripLength === 'day-trip' ? 'Date' : 'Dates'}
        </h3>
        {tripLength === 'day-trip' ? (
          <>
            <label className="text-sm">
              <span className="mb-1 block text-ink-700">Which day?</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm sm:w-1/2"
              />
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={findBestDay}
                onChange={(e) => setFindBestDay(e.target.checked)}
                className="h-4 w-4 rounded border-cream-300"
              />
              Suggest a better nearby day if conditions look better
            </label>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-ink-700">Start date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-ink-700">End date</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-ink-500">{nights} night{nights !== 1 ? 's' : ''}</p>
          </>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
          How far are you willing to drive?
        </h3>
        <div className="flex flex-wrap gap-2">
          {DRIVE_OPTIONS.map((h) => (
            <button
              key={h}
              onClick={() => setMaxDriveHours(h)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                maxDriveHours === h
                  ? 'border-teal-900 bg-teal-900 text-cream-50'
                  : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
              )}
            >
              {h}h{h === 8 ? '+' : ''}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
          Who's coming?
        </h3>
        <div className="flex flex-wrap gap-2">
          {GROUP_OPTIONS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGroupSize(g.value)}
              className={clsx(
                'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                groupSize === g.value
                  ? 'border-teal-900 bg-teal-900 text-cream-50'
                  : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
              )}
            >
              <span>{g.icon}</span> {g.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-cream-100 px-4 py-3">
          <span className="text-sm font-medium text-ink-700">🐕 Bringing a dog?</span>
          <button
            onClick={() => setBringingDog((v) => !v)}
            className={clsx(
              'relative h-7 w-12 rounded-full transition-colors',
              bringingDog ? 'bg-teal-700' : 'bg-cream-300',
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                bringingDog ? 'translate-x-5' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Adventure style
          </h3>
          <button
            onClick={() => setActivities([])}
            className={clsx(
              'text-xs font-medium',
              activities.length === 0 ? 'text-teal-800' : 'text-ink-500 hover:text-teal-800',
            )}
          >
            Anything — surprise me
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ACTIVITY_META) as ActivityTag[]).map((tag) => (
            <button
              key={tag}
              onClick={() => toggleActivity(tag)}
              className={clsx(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                activities.includes(tag)
                  ? 'border-teal-900 bg-teal-900 text-cream-50'
                  : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
              )}
            >
              <span>{ACTIVITY_META[tag].emoji}</span> {ACTIVITY_META[tag].label}
            </button>
          ))}
        </div>
      </Card>

      {tripLength !== 'day-trip' && (
        <Card className="p-5">
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Camping preference
          </h3>
          <div className="flex flex-wrap gap-2">
            {CAMPING_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setCampingPreference(c)}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  campingPreference === c
                    ? 'border-teal-900 bg-teal-900 text-cream-50'
                    : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
                )}
              >
                {CAMPING_LABELS[c]}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Comfort level <span className="normal-case text-ink-300">(optional)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {COMFORT_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => setComfortLevel((v) => (v === c.value ? undefined : c.value))}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  comfortLevel === c.value
                    ? 'border-teal-900 bg-teal-900 text-cream-50'
                    : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Budget <span className="normal-case text-ink-300">(optional)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((b) => (
              <button
                key={b.value}
                onClick={() => setBudget((v) => (v === b.value ? undefined : b.value))}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  budget === b.value
                    ? 'border-teal-900 bg-teal-900 text-cream-50'
                    : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Button size="lg" className="w-full" onClick={submit} disabled={loading}>
        {loading ? 'Finding your adventure…' : 'FIND MY ADVENTURE'}
      </Button>
    </div>
  )
}
