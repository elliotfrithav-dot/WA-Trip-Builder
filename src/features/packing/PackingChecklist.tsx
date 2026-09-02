import { useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import type { ChecklistItem } from './types'

interface PackingChecklistProps {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
}

const CATEGORY_ORDER = ['General', 'Camping', 'Diving', 'Snorkelling', 'Swimming', '4WD', 'Hiking', 'Dog', 'Other']

export function PackingChecklist({ items, onChange }: PackingChecklistProps) {
  const [newLabel, setNewLabel] = useState('')
  const [newCategory, setNewCategory] = useState('Other')

  const grouped = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>()
    for (const item of items) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push(item)
    }
    return [...map.entries()].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]),
    )
  }, [items])

  const packedCount = items.filter((i) => i.checked).length

  const toggle = (id: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
  }

  const remove = (id: string) => {
    onChange(items.filter((i) => i.id !== id))
  }

  const addItem = () => {
    const label = newLabel.trim()
    if (!label) return
    const item: ChecklistItem = {
      id: `custom-${Date.now()}`,
      label,
      category: newCategory,
      checked: false,
      custom: true,
    }
    onChange([...items, item])
    setNewLabel('')
  }

  const categories = [...new Set(items.map((i) => i.category))].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  )
  if (!categories.includes(newCategory)) categories.push(newCategory)

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">Packing checklist</h3>
        <span className="text-xs font-medium text-ink-500">
          {packedCount}/{items.length} packed
        </span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full rounded-full bg-teal-700 transition-all"
          style={{ width: items.length > 0 ? `${(packedCount / items.length) * 100}%` : '0%' }}
        />
      </div>

      <div className="space-y-5">
        {grouped.map(([category, categoryItems]) => (
          <div key={category}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-300">{category}</h4>
            <ul className="space-y-1.5">
              {categoryItems.map((item) => (
                <li key={item.id} className="group flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggle(item.id)}
                      className="h-4 w-4 rounded border-cream-300 text-teal-700 focus:ring-teal-600"
                    />
                    <span className={item.checked ? 'text-ink-300 line-through' : 'text-ink-700'}>{item.label}</span>
                  </label>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-xs text-ink-300 opacity-0 transition-opacity hover:text-terracotta-600 group-hover:opacity-100"
                    aria-label={`Remove ${item.label}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2 border-t border-cream-300/70 pt-4">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add your own item…"
          className="flex-1 rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="rounded-lg border border-cream-300 bg-white px-2 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={addItem}
          className="rounded-lg bg-teal-900 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-teal-800"
        >
          Add
        </button>
      </div>
    </Card>
  )
}
