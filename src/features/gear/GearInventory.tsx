import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { getGear, saveGear } from '../../lib/storage'
import { GEAR_CATEGORIES } from './types'
import type { GearItem, GearCategory } from './types'

export function GearInventory() {
  const [items, setItems] = useState<GearItem[]>([])
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<GearCategory>('Other')
  const [filter, setFilter] = useState<'all' | 'owned' | 'need-to-buy'>('all')

  useEffect(() => {
    setItems(getGear())
  }, [])

  const update = (next: GearItem[]) => {
    setItems(next)
    saveGear(next)
  }

  const toggleStatus = (id: string) => {
    update(items.map((i) => (i.id === id ? { ...i, status: i.status === 'owned' ? 'need-to-buy' : 'owned' } : i)))
  }

  const remove = (id: string) => update(items.filter((i) => i.id !== id))

  const updateField = (id: string, field: 'weightKg' | 'costAud', value: string) => {
    const num = value === '' ? undefined : Number(value)
    update(items.map((i) => (i.id === id ? { ...i, [field]: Number.isFinite(num) ? num : undefined } : i)))
  }

  const addItem = () => {
    const name = newName.trim()
    if (!name) return
    update([...items, { id: `custom-${Date.now()}`, name, category: newCategory, status: 'need-to-buy', custom: true }])
    setNewName('')
  }

  const grouped = useMemo(() => {
    const visible = items.filter((i) => filter === 'all' || i.status === filter)
    const map = new Map<GearCategory, GearItem[]>()
    for (const item of visible) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push(item)
    }
    return [...map.entries()].sort((a, b) => GEAR_CATEGORIES.indexOf(a[0]) - GEAR_CATEGORIES.indexOf(b[0]))
  }, [items, filter])

  const owned = items.filter((i) => i.status === 'owned').length
  const totalWeight = items.filter((i) => i.status === 'owned').reduce((s, i) => s + (i.weightKg ?? 0), 0)
  const totalCostToBuy = items.filter((i) => i.status === 'need-to-buy').reduce((s, i) => s + (i.costAud ?? 0), 0)

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">My Gear</h3>
          <div className="flex gap-2 text-xs">
            <Badge tone="good">{owned} owned</Badge>
            <Badge tone="warn">{items.length - owned} to buy</Badge>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-500">
          {totalWeight > 0 && <span>Owned gear weight: ~{totalWeight.toFixed(1)}kg</span>}
          {totalCostToBuy > 0 && <span>Estimated cost to complete kit: ~${totalCostToBuy.toFixed(0)}</span>}
        </div>
        <div className="mt-3 flex gap-2">
          {(['all', 'owned', 'need-to-buy'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f
                  ? 'border-teal-900 bg-teal-900 text-cream-50'
                  : 'border-cream-300 bg-white text-ink-700 hover:border-teal-500'
              }`}
            >
              {f === 'all' ? 'All' : f === 'owned' ? 'Owned' : 'Need to buy'}
            </button>
          ))}
        </div>
      </Card>

      {grouped.map(([category, categoryItems]) => (
        <Card key={category} className="p-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-300">{category}</h4>
          <ul className="space-y-2">
            {categoryItems.map((item) => (
              <li key={item.id} className="group flex flex-wrap items-center gap-2 border-b border-cream-200 pb-2 last:border-0 last:pb-0">
                <button
                  onClick={() => toggleStatus(item.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    item.status === 'owned'
                      ? 'border-teal-700 bg-teal-700/10 text-teal-800'
                      : 'border-terracotta-500/40 bg-terracotta-500/10 text-terracotta-600'
                  }`}
                >
                  {item.status === 'owned' ? '✓ Owned' : 'Need to buy'}
                </button>
                <span className="flex-1 text-sm text-ink-900">{item.name}</span>
                <input
                  type="number"
                  placeholder="kg"
                  value={item.weightKg ?? ''}
                  onChange={(e) => updateField(item.id, 'weightKg', e.target.value)}
                  className="w-16 rounded border border-cream-300 bg-white px-1.5 py-0.5 text-xs"
                />
                <input
                  type="number"
                  placeholder="$"
                  value={item.costAud ?? ''}
                  onChange={(e) => updateField(item.id, 'costAud', e.target.value)}
                  className="w-16 rounded border border-cream-300 bg-white px-1.5 py-0.5 text-xs"
                />
                <button
                  onClick={() => remove(item.id)}
                  className="text-xs text-ink-300 opacity-0 transition-opacity hover:text-terracotta-600 group-hover:opacity-100"
                  aria-label={`Remove ${item.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Card className="p-5">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-300">Add item</h4>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="e.g. Awning, satellite phone…"
            className="min-w-[10rem] flex-1 rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as GearCategory)}
            className="rounded-lg border border-cream-300 bg-white px-2 py-2 text-sm"
          >
            {GEAR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button onClick={addItem} className="rounded-lg bg-teal-900 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-teal-800">
            Add
          </button>
        </div>
      </Card>
    </div>
  )
}
