import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { wildlifeSpecies, wildlifeForMonth } from '../../data/wildlife'
import { findRegion } from '../../data/regions'
import { campsitesForRegion } from '../../data/campsites'
import { activitySitesForRegion } from '../../data/activitySites'
import { MONTH_NAMES } from '../../lib/dates'
import type { WildlifeSpecies, WildlifeCategory } from '../../data/types'

const LIKELIHOOD_LABEL: Record<WildlifeSpecies['likelihood'], string> = {
  common: 'Common',
  'likely-in-season': 'Likely in season',
  occasional: 'Occasional',
  rare: 'Rare',
}

const CATEGORY_LABEL: Record<WildlifeCategory, { label: string; emoji: string }> = {
  marine: { label: 'Marine', emoji: '🐬' },
  bird: { label: 'Birds', emoji: '🦅' },
  'land-animal': { label: 'Land animals', emoji: '🦘' },
  plant: { label: 'Flora', emoji: '🌿' },
}
const CATEGORY_ORDER: WildlifeCategory[] = ['marine', 'bird', 'land-animal', 'plant']

export function WildlifeCalendar() {
  const [mode, setMode] = useState<'month' | 'species'>('month')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [category, setCategory] = useState<WildlifeCategory | 'all'>('all')
  const [speciesId, setSpeciesId] = useState(wildlifeSpecies[0]?.id)

  const filteredSpecies = category === 'all' ? wildlifeSpecies : wildlifeSpecies.filter((w) => w.category === category)
  const selectedSpeciesId = filteredSpecies.some((w) => w.id === speciesId) ? speciesId : filteredSpecies[0]?.id
  const species = wildlifeSpecies.find((w) => w.id === selectedSpeciesId)
  const monthResults = wildlifeForMonth(month).filter((w) => category === 'all' || w.category === category)

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('month')}
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            mode === 'month'
              ? 'border-teal-900 bg-teal-900 text-cream-50'
              : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500'
          }`}
        >
          What can I see this month?
        </button>
        <button
          onClick={() => setMode('species')}
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            mode === 'species'
              ? 'border-teal-900 bg-teal-900 text-cream-50'
              : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500'
          }`}
        >
          Look up a species
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory('all')}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            category === 'all'
              ? 'border-teal-900 bg-teal-900 text-cream-50'
              : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500'
          }`}
        >
          All
        </button>
        {CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              category === c
                ? 'border-teal-900 bg-teal-900 text-cream-50'
                : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500'
            }`}
          >
            {CATEGORY_LABEL[c].emoji} {CATEGORY_LABEL[c].label}
          </button>
        ))}
      </div>

      {mode === 'month' && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {MONTH_NAMES.map((name, i) => (
              <button
                key={name}
                onClick={() => setMonth(i + 1)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  month === i + 1
                    ? 'border-teal-900 bg-teal-900 text-cream-50'
                    : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500'
                }`}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>

          {monthResults.length === 0 ? (
            <Card className="p-6 text-center text-sm text-ink-500">Nothing standout in {MONTH_NAMES[month - 1]}.</Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {monthResults.map((w) => (
                <Card key={w.id} className="overflow-hidden p-0">
                  {w.image && (
                    <div className="relative h-28 w-full">
                      <img src={w.image} alt="" className="h-full w-full object-cover" />
                      {w.imageCredit && (
                        <span className="absolute bottom-1 right-1.5 rounded bg-ink-900/50 px-1.5 py-0.5 text-[9px] text-cream-50">
                          {w.imageCredit}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{w.emoji}</span>
                    <div>
                      <h3 className="font-display font-semibold text-ink-900">{w.commonName}</h3>
                      <p className="text-xs italic text-ink-500">{w.scientificName}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone={w.season.monthsPeak.includes(month) ? 'good' : 'neutral'}>
                      {w.season.monthsPeak.includes(month) ? 'Peak season' : 'Possible'}
                    </Badge>
                    <Badge>{LIKELIHOOD_LABEL[w.likelihood]}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    Best spots: {w.bestRegionIds.map((id) => findRegion(id)?.name).filter(Boolean).join(', ')}
                  </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {mode === 'species' && species && (
        <>
          <select
            value={selectedSpeciesId}
            onChange={(e) => setSpeciesId(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm"
          >
            {filteredSpecies.map((w) => (
              <option key={w.id} value={w.id}>
                {w.emoji} {w.commonName}
              </option>
            ))}
          </select>

          <Card className="overflow-hidden p-0">
            {species.image && (
              <div className="relative h-48 w-full">
                <img src={species.image} alt="" className="h-full w-full object-cover" />
                {species.imageCredit && (
                  <span className="absolute bottom-1.5 right-2 rounded bg-ink-900/50 px-2 py-1 text-[10px] text-cream-50">
                    {species.imageCredit}
                  </span>
                )}
              </div>
            )}
            <div className="p-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{species.emoji}</span>
              <div>
                <h2 className="font-display text-lg font-semibold text-ink-900">{species.commonName}</h2>
                <p className="text-xs italic text-ink-500">{species.scientificName}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-300">Best months</p>
              <div className="flex flex-wrap gap-1">
                {MONTH_NAMES.map((name, i) => {
                  const m = i + 1
                  const peak = species.season.monthsPeak.includes(m)
                  const possible = species.season.monthsPossible.includes(m)
                  return (
                    <span
                      key={name}
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        peak
                          ? 'bg-teal-700 text-cream-50'
                          : possible
                            ? 'bg-teal-700/15 text-teal-800'
                            : 'bg-cream-200 text-ink-300'
                      }`}
                    >
                      {name.slice(0, 3)}
                    </span>
                  )
                })}
              </div>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Habitat" value={species.habitat} />
              <Row label="Behaviour" value={species.behaviour} />
              {species.category === 'marine' && (
                <>
                  <Row
                    label="Encounter method"
                    value={species.boatOnly ? 'Boat / tour only' : 'Can be seen from shore'}
                  />
                  <Row
                    label="Snorkel / dive suitable"
                    value={[species.snorkelSuitable && 'Snorkelling', species.diveSuitable && 'Diving']
                      .filter(Boolean)
                      .join(', ') || 'Not typically encountered in the water'}
                  />
                </>
              )}
              {species.safety && <Row label="Safety" value={species.safety} />}
              {species.conservationStatus && <Row label="Conservation status" value={species.conservationStatus} />}
            </dl>

            <div className="mt-4 border-t border-cream-300/70 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-300">Best locations</p>
              <div className="space-y-3">
                {species.bestRegionIds.map((regionId) => {
                  const region = findRegion(regionId)
                  if (!region) return null
                  const camps = campsitesForRegion(regionId)
                  const sites = activitySitesForRegion(regionId)
                  return (
                    <div key={regionId}>
                      <p className="text-sm font-medium text-ink-900">{region.name}</p>
                      <p className="text-xs text-ink-500">
                        {camps.length > 0 ? `${camps.length} nearby campsite${camps.length !== 1 ? 's' : ''}` : 'No seed camping data'}
                        {sites.length > 0 && ` · ${sites.length} activity site${sites.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</dt>
      <dd className="text-ink-700">{value}</dd>
    </div>
  )
}
