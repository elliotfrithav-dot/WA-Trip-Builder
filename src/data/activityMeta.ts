import type { ActivityTag } from './types'

export const ACTIVITY_META: Record<ActivityTag, { emoji: string; label: string }> = {
  'scuba-diving': { emoji: '🤿', label: 'Scuba diving' },
  'shore-diving': { emoji: '🤿', label: 'Shore diving' },
  snorkelling: { emoji: '🤿', label: 'Snorkelling' },
  swimming: { emoji: '🏊', label: 'Swimming' },
  'marine-wildlife': { emoji: '🐋', label: 'Marine wildlife' },
  dolphins: { emoji: '🐬', label: 'Dolphins' },
  sharks: { emoji: '🦈', label: 'Sharks' },
  whales: { emoji: '🐳', label: 'Whales' },
  reef: { emoji: '🐠', label: 'Reef / marine life' },
  seals: { emoji: '🦭', label: 'Seals / sea lions' },
  turtles: { emoji: '🐢', label: 'Turtles' },
  birdlife: { emoji: '🦅', label: 'Wildlife / birdlife' },
  hiking: { emoji: '🥾', label: 'Hiking' },
  camping: { emoji: '🏕', label: 'Camping' },
  'four-wd': { emoji: '🚙', label: '4WD / off-road' },
  photography: { emoji: '📸', label: 'Photography' },
  scenic: { emoji: '🌅', label: 'Scenic / relaxing' },
  food: { emoji: '🍴', label: 'Food & restaurants' },
  flora: { emoji: '🌿', label: 'Nature / flora' },
  beaches: { emoji: '🏖', label: 'Beaches' },
}

export const CAMPING_LABELS: Record<string, string> = {
  'caravan-campground': 'Caravan / campground',
  'basic-campground': 'Basic campground',
  'remote-camping': 'Remote camping',
  'legal-secluded-camping': 'Legal secluded camping',
  'beach-camping': 'Beach camping where legal',
  'four-wd-access-camping': '4WD-access camping',
  'dont-care': "Don't care",
  'no-camping': 'No camping / accommodation',
}
