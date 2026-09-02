import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { TripBuilderForm } from '../features/trip-builder/TripBuilderForm'
import { TripOptionCard } from '../features/trip-builder/TripOptionCard'
import { TripComparison } from '../features/trip-builder/TripComparison'
import { ItineraryView } from '../features/trip-builder/ItineraryView'
import { generateTripOptions } from '../features/trip-builder/scoring'
import { generateRoadTripOptions } from '../features/trip-builder/roadTrip'
import { generateItinerary } from '../features/trip-builder/itinerary'
import { generatePackingList } from '../features/packing/checklist'
import { WildlifeCalendar } from '../features/wildlife-calendar/WildlifeCalendar'
import { CustomTripBuilder } from '../features/trip-builder/CustomTripBuilder'
import { saveTrip } from '../lib/storage'
import { Button } from '../components/ui/Button'
import type { TripCriteria, TripOption, ItineraryDay } from '../features/trip-builder/types'
import type { ChecklistItem } from '../features/packing/types'

type Stage = 'form' | 'results' | 'itinerary'
type Tab = 'builder' | 'wildlife' | 'custom'

export function PlanPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: Tab = tabParam === 'wildlife' ? 'wildlife' : tabParam === 'custom' ? 'custom' : 'builder'
  const [stage, setStage] = useState<Stage>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [criteria, setCriteria] = useState<TripCriteria | null>(null)
  const [options, setOptions] = useState<TripOption[]>([])
  const [selected, setSelected] = useState<TripOption | null>(null)
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [packingList, setPackingList] = useState<ChecklistItem[]>([])
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (c: TripCriteria) => {
    setLoading(true)
    setError(null)
    setCriteria(c)
    try {
      const results = c.tripLength === 'road-trip' ? await generateRoadTripOptions(c) : await generateTripOptions(c)
      setOptions(results)
      setStage('results')
      if (results.length === 0) {
        setError('Nothing is within your drive limit — try increasing "How far are you willing to drive?" and searching again.')
      }
    } catch {
      setError('Something went wrong generating trip options. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBuild = async (option: TripOption) => {
    if (!criteria) return
    setLoading(true)
    setSelected(option)
    setSaved(false)
    try {
      const days = await generateItinerary(option, criteria)
      setItinerary(days)
      setPackingList(generatePackingList(criteria, option))
      setStage('itinerary')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomGenerate = async (result: { option: TripOption; criteria: TripCriteria }) => {
    setLoading(true)
    setCriteria(result.criteria)
    setSelected(result.option)
    setSaved(false)
    try {
      const days = await generateItinerary(result.option, result.criteria)
      setItinerary(days)
      setPackingList(generatePackingList(result.criteria, result.option))
      setStage('itinerary')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!selected || !criteria) return
    saveTrip({
      id: `${selected.id}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      criteria,
      option: selected,
      itinerary,
      packingList,
    })
    setSaved(true)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Plan</h1>
        <p className="text-sm text-ink-500">
          {tab === 'builder'
            ? "Tell us your dates and constraints — we'll find the best adventure to match."
            : tab === 'custom'
              ? 'Pick your own campsites and activity sites, then build an itinerary from them.'
              : 'See what wildlife is around, and when.'}
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSearchParams({})}
          className={clsx(
            'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
            tab === 'builder'
              ? 'border-teal-900 bg-teal-900 text-cream-50'
              : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
          )}
        >
          🧭 Trip Builder
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'custom' })}
          className={clsx(
            'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
            tab === 'custom'
              ? 'border-teal-900 bg-teal-900 text-cream-50'
              : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
          )}
        >
          🧩 Custom Trip
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'wildlife' })}
          className={clsx(
            'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
            tab === 'wildlife'
              ? 'border-teal-900 bg-teal-900 text-cream-50'
              : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
          )}
        >
          🐋 Wildlife Calendar
        </button>
      </div>

      {tab === 'wildlife' && <WildlifeCalendar />}

      {tab === 'custom' && stage !== 'itinerary' && <CustomTripBuilder onGenerate={handleCustomGenerate} />}

      {tab === 'builder' && stage === 'form' && <TripBuilderForm onSubmit={handleSubmit} loading={loading} />}

      {tab === 'builder' && stage === 'results' && (
        <div className="space-y-5">
          <Button variant="ghost" size="sm" onClick={() => setStage('form')}>
            ← Adjust criteria
          </Button>
          <h2 className="font-display text-lg font-semibold text-ink-900">YOUR ADVENTURE OPTIONS</h2>
          {error && <p className="rounded-xl bg-terracotta-500/10 p-4 text-sm text-terracotta-600">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {options.map((o, i) => (
              <TripOptionCard key={o.id} option={o} rank={i + 1} onBuild={handleBuild} />
            ))}
          </div>
          <TripComparison options={options} onBuild={handleBuild} />
        </div>
      )}

      {(tab === 'builder' || tab === 'custom') && stage === 'itinerary' && selected && (
        <div className="space-y-5">
          <Button variant="ghost" size="sm" onClick={() => setStage(tab === 'custom' ? 'form' : 'results')}>
            ← Back to {tab === 'custom' ? 'your selections' : 'options'}
          </Button>
          <ItineraryView
            option={selected}
            itinerary={itinerary}
            packingList={packingList}
            onPackingListChange={(items) => {
              setPackingList(items)
              setSaved(false)
            }}
            onSave={handleSave}
            saved={saved}
          />
        </div>
      )}
    </div>
  )
}
