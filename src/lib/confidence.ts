import type { DataConfidence } from '../data/types'

export const CONFIDENCE_LABEL: Record<DataConfidence, string> = {
  verified: '✅ Verified',
  'community-reported': '👥 Community-reported',
  'needs-verification': '⚠️ Needs verification',
}
