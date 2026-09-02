export type GearStatus = 'owned' | 'need-to-buy'
export type GearCategory =
  | 'Power & Compressor'
  | 'Water'
  | 'Refrigeration'
  | 'Cooking'
  | 'Lighting'
  | 'Consumables'
  | '4WD Recovery'
  | 'Diving'
  | 'Camping'
  | 'Other'

export interface GearItem {
  id: string
  name: string
  category: GearCategory
  status: GearStatus
  weightKg?: number
  costAud?: number
  notes?: string
  custom?: boolean
}

export const GEAR_CATEGORIES: GearCategory[] = [
  'Power & Compressor',
  'Water',
  'Refrigeration',
  'Cooking',
  'Lighting',
  'Consumables',
  '4WD Recovery',
  'Diving',
  'Camping',
  'Other',
]
