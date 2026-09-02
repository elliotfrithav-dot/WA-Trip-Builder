import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { getCart, removeFromCart, type CartItem } from '../../lib/customTripCart'
import { campsites } from '../../data/campsites'
import { activitySites } from '../../data/activitySites'
import { findRegion } from '../../data/regions'
import { buildCustomTripOption, type CustomStopInput } from './customTrip'
import type { TripCriteria, TripOption } from './types'

interface RegionGroup {
  regionId: string
  campsiteIds: string[]
  activitySiteIds: string[]
}

function groupCartByRegion(cart: CartItem[]): RegionGroup[] {
  const order: string[] = []
  const map = new Map<string, RegionGroup>()
  for (const item of cart) {
    const site = item.kind === 'campsite' ? campsites.find((c) => c.id === item.id) : activitySites.find((s) => s.id === item.id)
    if (!site) continue
    if (!map.has(site.regionId)) {
      map.set(site.regionId, { regionId: site.regionId, campsiteIds: [], activitySiteIds: [] })
      order.push(site.regionId)
    }
    const group = map.get(site.regionId)!
    if (item.kind === 'campsite') group.campsiteIds.push(item.id)
    else group.activitySiteIds.push(item.id)
  }
  return order.map((id) => map.get(id)!)
}

function defaultStartDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

interface CustomTripBuilderProps {
  onGenerate: (result: { option: TripOption; criteria: TripCriteria }) => void
}

export function CustomTripBuilder({ onGenerate }: CustomTripBuilderProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [groups, setGroups] = useState<RegionGroup[]>([])
  const [nightsByRegion, setNightsByRegion] = useState<Record<string, number>>({})
  const [order, setOrder] = useState<string[]>([])
  const [startDate, setStartDate] = useState(defaultStartDate())
  const [groupSize, setGroupSize] = useState(2)
  const [bringingDog, setBringingDog] = useState(false)

  useEffect(() => {
    const c = getCart()
    setCart(c)
    const g = groupCartByRegion(c)
    setGroups(g)
    setOrder(g.map((r) => r.regionId))
    setNightsByRegion((prev) => {
      const next = { ...prev }
      for (const r of g) if (!(r.regionId in next)) next[r.regionId] = 1
      return next
    })
  }, [])

  const refresh = () => {
    const c = getCart()
    setCart(c)
    const g = groupCartByRegion(c)
    setGroups(g)
    setOrder((prev) => {
      const ids = g.map((r) => r.regionId)
      const kept = prev.filter((id) => ids.includes(id))
      const added = ids.filter((id) => !kept.includes(id))
      return [...kept, ...added]
    })
  }

  const removeItem = (item: CartItem) => {
    removeFromCart(item.kind, item.id)
    refresh()
  }

  const moveRegion = (regionId: string, dir: -1 | 1) => {
    setOrder((prev) => {
      const idx = prev.indexOf(regionId)
      const swapWith = idx + dir
      if (swapWith < 0 || swapWith >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      return next
    })
  }

  const orderedGroups = order.map((id) => groups.find((g) => g.regionId === id)).filter((g): g is RegionGroup => Boolean(g))
  const totalNights = orderedGroups.reduce((sum, g) => sum + (nightsByRegion[g.regionId] ?? 1), 0)

  const handleGenerate = () => {
    const stopInputs: CustomStopInput[] = orderedGroups.map((g) => ({
      regionId: g.regionId,
      nights: nightsByRegion[g.regionId] ?? 1,
      campsiteIds: g.campsiteIds,
      activitySiteIds: g.activitySiteIds,
    }))
    const result = buildCustomTripOption(stopInputs, startDate, groupSize, bringingDog)
    if (result) onGenerate(result)
  }

  if (cart.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-2xl">🗺️</p>
        <h3 className="mt-2 font-display font-semibold text-ink-900">Your custom trip is empty</h3>
        <p className="mt-1 text-sm text-ink-500">
          Browse the Explore map, open a campsite or activity site, and tap "Add to Custom Trip" to start building your own itinerary.
        </p>
        <Link to="/explore">
          <Button className="mt-4" size="sm">
            Go to Explore
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orderedGroups.map((g, i) => {
        const region = findRegion(g.regionId)
        if (!region) return null
        return (
          <Card key={g.regionId} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-ink-900">{region.name}</h3>
              <div className="flex items-center gap-1">
                <button
                  disabled={i === 0}
                  onClick={() => moveRegion(g.regionId, -1)}
                  className="rounded px-2 py-1 text-xs text-ink-500 hover:bg-cream-200 disabled:opacity-30"
                  aria-label="Move earlier"
                >
                  ↑
                </button>
                <button
                  disabled={i === orderedGroups.length - 1}
                  onClick={() => moveRegion(g.regionId, 1)}
                  className="rounded px-2 py-1 text-xs text-ink-500 hover:bg-cream-200 disabled:opacity-30"
                  aria-label="Move later"
                >
                  ↓
                </button>
              </div>
            </div>

            <ul className="mt-2 space-y-1.5">
              {g.campsiteIds.map((id) => {
                const c = campsites.find((x) => x.id === id)
                if (!c) return null
                return (
                  <li key={id} className="flex items-center justify-between text-sm">
                    <span>🏕 {c.name}</span>
                    <button onClick={() => removeItem({ kind: 'campsite', id })} className="text-xs text-ink-300 hover:text-terracotta-600">
                      Remove
                    </button>
                  </li>
                )
              })}
              {g.activitySiteIds.map((id) => {
                const s = activitySites.find((x) => x.id === id)
                if (!s) return null
                return (
                  <li key={id} className="flex items-center justify-between text-sm">
                    <span>
                      {s.type === 'dive' || s.type === 'snorkel' ? '🤿' : s.type === 'hike' ? '🥾' : '🏖'} {s.name}
                    </span>
                    <button onClick={() => removeItem({ kind: 'activity', id })} className="text-xs text-ink-300 hover:text-terracotta-600">
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-ink-500">Nights here:</span>
              <button
                onClick={() => setNightsByRegion((prev) => ({ ...prev, [g.regionId]: Math.max(1, (prev[g.regionId] ?? 1) - 1) }))}
                className="h-6 w-6 rounded-full border border-cream-300 text-ink-700 hover:border-teal-500"
              >
                −
              </button>
              <span className="w-4 text-center font-medium">{nightsByRegion[g.regionId] ?? 1}</span>
              <button
                onClick={() => setNightsByRegion((prev) => ({ ...prev, [g.regionId]: (prev[g.regionId] ?? 1) + 1 }))}
                className="h-6 w-6 rounded-full border border-cream-300 text-ink-700 hover:border-teal-500"
              >
                +
              </button>
            </div>
          </Card>
        )
      })}

      <Card className="p-5">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">Trip details</h3>
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
            <span className="mb-1 block text-ink-700">Group size</span>
            <input
              type="number"
              min={1}
              value={groupSize}
              onChange={(e) => setGroupSize(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" checked={bringingDog} onChange={(e) => setBringingDog(e.target.checked)} className="h-4 w-4 rounded border-cream-300" />
          🐕 Bringing a dog?
        </label>
        <p className="mt-2 text-xs text-ink-500">
          {orderedGroups.length} stop{orderedGroups.length !== 1 ? 's' : ''} · {totalNights} night{totalNights !== 1 ? 's' : ''} total
        </p>
      </Card>

      <Button size="lg" className="w-full" onClick={handleGenerate}>
        GENERATE MY TRIP
      </Button>
    </div>
  )
}
