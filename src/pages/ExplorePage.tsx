import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { MapView, DEFAULT_LAYERS, type MapLayerVisibility } from '../components/map/MapView'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { regions } from '../data/regions'
import { campsitesForRegion } from '../data/campsites'
import { activitySitesForRegion } from '../data/activitySites'
import { wildlifeForRegion } from '../data/wildlife'
import { formatDriveTime } from '../services/distance'
import { fetchWeatherForecast, weatherForDate } from '../services/weather'
import { fetchMarineForecast, marineForDate } from '../services/marine'
import { gradeSiteConditions, GRADE_LABEL, GRADE_EMOJI, type SiteConditionsResult } from '../services/siteConditions'
import { isDogOk } from '../lib/dogPolicy'
import { todayIso } from '../lib/dates'
import { ACTIVITY_META } from '../data/activityMeta'
import type { ActivityTag } from '../data/types'
import type { DriveLimitHours } from '../features/trip-builder/types'

const DRIVE_OPTIONS: DriveLimitHours[] = [1, 2, 3, 4, 5, 6, 8]
const LAYER_OPTIONS: { key: keyof MapLayerVisibility; label: string; icon: string }[] = [
  { key: 'campsites', label: 'Campsites', icon: '🏕' },
  { key: 'dive', label: 'Dive', icon: '🤿' },
  { key: 'snorkel', label: 'Snorkel', icon: '🤿' },
  { key: 'hike', label: 'Hikes', icon: '🥾' },
  { key: 'beach', label: 'Beaches', icon: '🏖' },
]

function regionHasConfirmedDogAccess(regionId: string): boolean {
  const camps = campsitesForRegion(regionId)
  const sites = activitySitesForRegion(regionId)
  return camps.some((c) => isDogOk(c.dogPolicy)) || sites.some((s) => isDogOk(s.dogPolicy))
}

export function ExplorePage() {
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>()
  const [activities, setActivities] = useState<ActivityTag[]>([])
  const [dogOnly, setDogOnly] = useState(false)
  const [maxDriveHours, setMaxDriveHours] = useState<DriveLimitHours | null>(null)
  const [layers, setLayers] = useState<MapLayerVisibility>(DEFAULT_LAYERS)
  const [showFilters, setShowFilters] = useState(false)
  const [conditions, setConditions] = useState<Record<string, SiteConditionsResult | 'loading' | 'error'>>({})

  const toggleActivity = (tag: ActivityTag) => {
    setActivities((prev) => (prev.includes(tag) ? prev.filter((a) => a !== tag) : [...prev, tag]))
  }
  const toggleLayer = (key: keyof MapLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredRegions = regions.filter((r) => {
    if (activities.length > 0 && !r.activities.some((a) => activities.includes(a))) return false
    if (dogOnly && !regionHasConfirmedDogAccess(r.id)) return false
    if (maxDriveHours && r.driveTimeFromPerthMin > maxDriveHours * 60) return false
    return true
  })

  useEffect(() => {
    const toFetch = filteredRegions.filter((r) => !conditions[r.id])
    if (toFetch.length === 0) return
    setConditions((prev) => {
      const next = { ...prev }
      for (const r of toFetch) next[r.id] = 'loading'
      return next
    })
    toFetch.forEach(async (region) => {
      try {
        const [weather, marine] = await Promise.all([
          fetchWeatherForecast(region.id, region.lat, region.lng),
          fetchMarineForecast(region.id, region.lat, region.lng),
        ])
        const day = weatherForDate(weather, todayIso())
        const marineDay = marineForDate(marine, todayIso())
        const grade = gradeSiteConditions({ bestWindDirection: undefined }, day, marineDay)
        setConditions((prev) => ({ ...prev, [region.id]: grade }))
      } catch {
        setConditions((prev) => ({ ...prev, [region.id]: 'error' }))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRegions.map((r) => r.id).join(',')])

  const month = new Date().getMonth() + 1

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Explore</h1>
        <p className="text-sm text-ink-500">Campsites, dive & snorkel sites, hikes and wildlife along the coast.</p>
      </div>

      <MapView highlightedRegionId={selectedRegionId} height="380px" visibleRegionIds={filteredRegions.map((r) => r.id)} layers={layers} />

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {LAYER_OPTIONS.map((l) => (
            <button
              key={l.key}
              onClick={() => toggleLayer(l.key)}
              className={clsx(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                layers[l.key]
                  ? 'border-teal-900 bg-teal-900 text-cream-50'
                  : 'border-cream-300 bg-white text-ink-500 hover:border-teal-500',
              )}
            >
              {l.icon} {l.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className="text-sm font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2"
        >
          {showFilters ? 'Hide filters' : 'Filters'}
          {(activities.length > 0 || dogOnly || maxDriveHours) && ` (${filteredRegions.length} match)`}
        </button>

        {showFilters && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-300">Activity</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(ACTIVITY_META) as ActivityTag[]).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleActivity(tag)}
                    className={clsx(
                      'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      activities.includes(tag)
                        ? 'border-teal-900 bg-teal-900 text-cream-50'
                        : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
                    )}
                  >
                    {ACTIVITY_META[tag].emoji} {ACTIVITY_META[tag].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-300">Max drive from Perth</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setMaxDriveHours(null)}
                  className={clsx(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    maxDriveHours === null
                      ? 'border-teal-900 bg-teal-900 text-cream-50'
                      : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
                  )}
                >
                  Any
                </button>
                {DRIVE_OPTIONS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setMaxDriveHours(h)}
                    className={clsx(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      maxDriveHours === h
                        ? 'border-teal-900 bg-teal-900 text-cream-50'
                        : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500',
                    )}
                  >
                    {h}h{h === 8 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={dogOnly} onChange={(e) => setDogOnly(e.target.checked)} className="h-4 w-4 rounded border-cream-300" />
              🐕 Dog-friendly only (confirmed in seed data)
            </label>
          </div>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRegions.length === 0 && (
          <Card className="col-span-full p-8 text-center text-sm text-ink-500">
            No regions match these filters — try relaxing one.
          </Card>
        )}
        {filteredRegions.map((r) => {
          const cond = conditions[r.id]
          const wildlifeNow = wildlifeForRegion(r.id).filter((w) => w.season.monthsPossible.includes(month))
          return (
            <Link key={r.id} to={`/region/${r.id}`} className="block" onMouseEnter={() => setSelectedRegionId(r.id)}>
            <Card
              className={clsx(
                'cursor-pointer overflow-hidden transition-shadow hover:shadow-md',
                selectedRegionId === r.id && 'ring-2 ring-teal-700',
              )}
            >
              {r.heroImage && (
                <div className="relative h-32 w-full">
                  <img src={r.heroImage} alt="" className="h-full w-full object-cover" />
                  {r.heroImageCredit && (
                    <span className="absolute bottom-1 right-1.5 rounded bg-ink-900/50 px-1.5 py-0.5 text-[10px] text-cream-50">
                      {r.heroImageCredit}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-ink-900">{r.name}</h3>
                  {cond && cond !== 'loading' && cond !== 'error' && (
                    <Badge tone={cond.grade === 'excellent' || cond.grade === 'good' ? 'good' : 'warn'}>
                      {GRADE_EMOJI[cond.grade]} {GRADE_LABEL[cond.grade]}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-500">{r.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge>🚙 {formatDriveTime(r.driveTimeFromPerthMin)}</Badge>
                  {r.activities.slice(0, 3).map((a) => (
                    <Badge key={a}>
                      {ACTIVITY_META[a].emoji} {ACTIVITY_META[a].label}
                    </Badge>
                  ))}
                  {wildlifeNow.length > 0 && (
                    <Badge tone="accent">
                      {wildlifeNow.map((w) => w.emoji).join(' ')} in season
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
