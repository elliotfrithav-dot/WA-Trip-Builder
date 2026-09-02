import type { TripCriteria } from '../trip-builder/types'
import type { TripOption } from '../trip-builder/types'
import type { ChecklistItem } from './types'

const GENERAL = [
  'Water (several litres per person per day)',
  'Sun protection (hat, sunscreen, sunglasses)',
  'First aid kit',
  'Phone / camera, charged',
  'Cash for park/parking fees',
  'Rubbish bags — pack it out',
]

const CAMPING_MULTI_NIGHT = [
  'Tent',
  'Sleeping bag',
  'Sleeping mat',
  'Camp stove + gas',
  'Cooking gear & utensils',
  'Esky / cooler',
  'Torch or headlamp + spare batteries',
  'Camp chairs',
  'Rope / tarp',
  'Toilet paper & hand sanitiser',
]

const DIVE_ESSENTIALS = [
  'Mask & snorkel',
  'Fins',
  'Wetsuit',
  'BCD & regulator',
  'Dive computer',
  'Weight belt',
  'Surface marker buoy',
  'Dive certification card',
  'Dive log book',
]

const SNORKEL_ESSENTIALS = ['Mask & snorkel', 'Fins', 'Rashie / wetsuit top', 'Reef-safe sunscreen', 'Snorkel vest / flotation aid']

const SWIMMING_ESSENTIALS = ['Swimwear', 'Towel', 'Reef-safe sunscreen']

const FOUR_WD_ESSENTIALS = [
  'Tyre pressure gauge & compressor',
  'Recovery boards',
  'Shovel',
  'Spare tyre + basic tools',
  'UHF radio',
]

const HIKING_ESSENTIALS = ['Sturdy footwear', 'Day pack', 'Map / offline navigation', 'Extra water for the trail']

const DOG_ESSENTIALS = [
  'Dog food & bowls',
  'Lead & collar with ID tag',
  'Dog waste bags',
  'Dog bed / blanket',
  'Water for the dog',
]

function toItems(labels: string[], category: string): ChecklistItem[] {
  return labels.map((label) => ({
    id: `${category}-${label}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label,
    category,
    checked: false,
  }))
}

export function generatePackingList(criteria: TripCriteria, option: TripOption): ChecklistItem[] {
  const items: ChecklistItem[] = [...toItems(GENERAL, 'General')]

  const isCamping = criteria.tripLength === 'multi-day' && option.campsiteIds.length > 0
  if (isCamping) items.push(...toItems(CAMPING_MULTI_NIGHT, 'Camping'))

  const activities = criteria.activities
  const wantsDive = activities.includes('scuba-diving') || activities.includes('shore-diving')
  const wantsSnorkel = activities.includes('snorkelling') || activities.length === 0
  const wantsSwim = activities.includes('swimming')

  if (wantsDive) items.push(...toItems(DIVE_ESSENTIALS, 'Diving'))
  else if (wantsSnorkel) items.push(...toItems(SNORKEL_ESSENTIALS, 'Snorkelling'))
  if (wantsSwim && !wantsDive && !wantsSnorkel) items.push(...toItems(SWIMMING_ESSENTIALS, 'Swimming'))

  if (activities.includes('four-wd')) items.push(...toItems(FOUR_WD_ESSENTIALS, '4WD'))
  if (activities.includes('hiking')) items.push(...toItems(HIKING_ESSENTIALS, 'Hiking'))
  if (criteria.bringingDog) items.push(...toItems(DOG_ESSENTIALS, 'Dog'))

  // De-duplicate by label (e.g. reef-safe sunscreen can appear via multiple categories)
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.label.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
