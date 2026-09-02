import type { GearItem } from './types'

function item(name: string, category: GearItem['category']): Omit<GearItem, 'id'> {
  return { name, category, status: 'need-to-buy' }
}

// A starting inventory to build from — everything defaults to "need to buy"
// since this is meant to track what still needs sorting out, not a
// pre-filled fantasy list. Tick things off as "owned" as you acquire them.
const SEED: Omit<GearItem, 'id'>[] = [
  item('12V tyre compressor', 'Power & Compressor'),
  item('Portable jump starter / power pack', 'Power & Compressor'),
  item('Water purification (filter or tablets)', 'Water'),
  item('Jerry cans (20L) for water storage', 'Water'),
  item('Collapsible water container', 'Water'),
  item('12V portable fridge/freezer', 'Refrigeration'),
  item('Esky / passive cooler (backup)', 'Refrigeration'),
  item('Camp stove + gas', 'Cooking'),
  item('Cookware set', 'Cooking'),
  item('Cutlery, plates & mugs', 'Cooking'),
  item('Kettle', 'Cooking'),
  item('LED lantern', 'Lighting'),
  item('Head torch', 'Lighting'),
  item('12V camp light strip', 'Lighting'),
  item('Firewood / fire starters', 'Consumables'),
  item('Bin bags', 'Consumables'),
  item('Toilet paper & hand sanitiser', 'Consumables'),
  item('Insect repellent', 'Consumables'),
  item('Sunscreen', 'Consumables'),
  item('Traction boards', '4WD Recovery'),
  item('Snatch strap', '4WD Recovery'),
  item('Shovel', '4WD Recovery'),
  item('Tyre repair kit', '4WD Recovery'),
  item('Tent', 'Camping'),
  item('Sleeping bag', 'Camping'),
  item('Sleeping mat', 'Camping'),
  item('Camp chairs', 'Camping'),
]

export function seedGear(): GearItem[] {
  return SEED.map((s, i) => ({ ...s, id: `seed-${i}-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` }))
}
