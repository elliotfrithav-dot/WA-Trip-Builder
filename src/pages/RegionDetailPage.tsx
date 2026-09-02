import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapView } from '../components/map/MapView'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { findRegion } from '../data/regions'
import { campsitesForRegion } from '../data/campsites'
import { activitySitesForRegion } from '../data/activitySites'
import { wildlifeForRegion } from '../data/wildlife'
import { formatDriveTime } from '../services/distance'
import { CAMPING_LABELS, ACTIVITY_META } from '../data/activityMeta'
import { CONFIDENCE_LABEL } from '../lib/confidence'
import { getCart, toggleCart, type CartKind } from '../lib/customTripCart'
import { WeatherWidget } from '../features/dashboard/WeatherWidget'
import type { ActivitySiteType } from '../data/types'

const TYPE_ICON: Record<ActivitySiteType, string> = {
  dive: '🤿',
  snorkel: '🤿',
  hike: '🥾',
  beach: '🏖',
}

export function RegionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const region = findRegion(id ?? '')
  const [cartKeys, setCartKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    setCartKeys(new Set(getCart().map((i) => `${i.kind}:${i.id}`)))
  }, [id])

  const handleToggle = (kind: CartKind, itemId: string) => {
    toggleCart(kind, itemId)
    setCartKeys(new Set(getCart().map((i) => `${i.kind}:${i.id}`)))
  }

  if (!region) {
    return (
      <div className="space-y-4">
        <Link to="/explore" className="text-sm font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2">
          ← Back to Explore
        </Link>
        <Card className="p-8 text-center text-sm text-ink-500">Region not found.</Card>
      </div>
    )
  }

  const camps = campsitesForRegion(region.id)
  const sites = activitySitesForRegion(region.id)
  const month = new Date().getMonth() + 1
  const wildlifeNow = wildlifeForRegion(region.id).filter((w) => w.season.monthsPossible.includes(month))
  const cartCount = cartKeys.size

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/explore" className="text-sm font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2">
          ← Back to Explore
        </Link>
        {cartCount > 0 && (
          <Link to="/plan?tab=custom" className="text-sm font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2">
            🧩 {cartCount} in Custom Trip →
          </Link>
        )}
      </div>

      {region.heroImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-2xl">
          <img src={region.heroImage} alt="" className="h-full w-full object-cover" />
          {region.heroImageCredit && (
            <span className="absolute bottom-1 right-1.5 rounded bg-ink-900/50 px-1.5 py-0.5 text-[10px] text-cream-50">
              {region.heroImageCredit}
            </span>
          )}
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">{region.name}</h1>
        <p className="mt-1 text-sm text-ink-500">{region.blurb}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge>🚙 {formatDriveTime(region.driveTimeFromPerthMin)} from Perth</Badge>
          {region.parkPassRequired && <Badge tone="warn">🎫 Park Pass required</Badge>}
          {region.nearestFuelTown && <Badge tone="neutral">⛽ Fuel: {region.nearestFuelTown}</Badge>}
          {region.nearestMedicalTown && <Badge tone="neutral">🏥 Medical: {region.nearestMedicalTown}</Badge>}
          {wildlifeNow.length > 0 && (
            <Badge tone="accent">{wildlifeNow.map((w) => w.emoji).join(' ')} in season</Badge>
          )}
        </div>
      </div>

      <WeatherWidget fixedLocation={{ id: region.id, name: region.name, lat: region.lat, lng: region.lng }} />

      <MapView standalone visibleRegionIds={[region.id]} height="320px" />

      {camps.length > 0 && (
        <div>
          <h2 className="mb-2 font-display text-lg font-semibold text-ink-900">Campsites</h2>
          <div className="space-y-2">
            {camps.map((c) => {
              const inCart = cartKeys.has(`campsite:${c.id}`)
              return (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link to={`/site/campsite/${c.id}`} className="font-display font-medium text-ink-900 hover:text-teal-800">
                        🏕 {c.name}
                      </Link>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge>{CAMPING_LABELS[c.campingType] ?? c.campingType}</Badge>
                        <Badge>💰 {c.feesAud}</Badge>
                        <Badge tone={c.dogPolicy === 'prohibited' ? 'warn' : 'good'}>🐕 {c.dogPolicy.replace(/-/g, ' ')}</Badge>
                        <Badge tone="neutral">{CONFIDENCE_LABEL[c.confidence]}</Badge>
                      </div>
                    </div>
                    <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-cream-300 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:border-teal-500">
                      <input
                        type="checkbox"
                        checked={inCart}
                        onChange={() => handleToggle('campsite', c.id)}
                        className="h-4 w-4 rounded border-cream-300"
                      />
                      Add to trip
                    </label>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {sites.length > 0 && (
        <div>
          <h2 className="mb-2 font-display text-lg font-semibold text-ink-900">Activities</h2>
          <div className="space-y-2">
            {sites.map((s) => {
              const inCart = cartKeys.has(`activity:${s.id}`)
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link to={`/site/activity/${s.id}`} className="font-display font-medium text-ink-900 hover:text-teal-800">
                        {TYPE_ICON[s.type]} {s.name}
                      </Link>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge>{s.type}</Badge>
                        <Badge>{s.difficulty}</Badge>
                        {s.costAud && <Badge>💰 {s.costAud}</Badge>}
                        <Badge tone={s.dogPolicy === 'prohibited' ? 'warn' : 'good'}>🐕 {s.dogPolicy.replace(/-/g, ' ')}</Badge>
                        <Badge tone="neutral">{CONFIDENCE_LABEL[s.confidence]}</Badge>
                      </div>
                    </div>
                    <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-cream-300 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:border-teal-500">
                      <input
                        type="checkbox"
                        checked={inCart}
                        onChange={() => handleToggle('activity', s.id)}
                        className="h-4 w-4 rounded border-cream-300"
                      />
                      Add to trip
                    </label>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {camps.length === 0 && sites.length === 0 && (
        <Card className="p-8 text-center text-sm text-ink-500">No campsites or activity sites recorded for this region yet.</Card>
      )}

      {region.activities.length > 0 && (
        <div>
          <h2 className="mb-2 font-display text-lg font-semibold text-ink-900">All activities here</h2>
          <div className="flex flex-wrap gap-1.5">
            {region.activities.map((a) => (
              <Badge key={a}>
                {ACTIVITY_META[a].emoji} {ACTIVITY_META[a].label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {cartCount > 0 && (
        <Link to="/plan?tab=custom">
          <Button className="w-full">View Custom Trip ({cartCount}) →</Button>
        </Link>
      )}
    </div>
  )
}
