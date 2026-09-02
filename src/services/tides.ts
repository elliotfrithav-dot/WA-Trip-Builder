// There is no free, official Australian tide-prediction API — BOM sells
// tide tables, and third-party APIs (WorldTides, Stormglass) are paid beyond
// a tiny trial. Rather than fabricate port-specific tide *times* (which
// require real harmonic constituents we don't have), this module only
// derives the one piece of tide-relevant information that IS exact,
// astronomically: the Moon's phase, and the resulting spring/neap tidal
// range category. This is a real physical relationship, not an invented
// number — but it is NOT a substitute for a real tide table and must never
// be presented as one.

export type TideRangeCategory = 'spring' | 'neap' | 'intermediate'

export interface TideEstimate {
  date: string
  moonPhase: number // 0 = new moon, 0.5 = full moon, 1 = next new moon
  rangeCategory: TideRangeCategory
  label: string
  disclaimer: string
}

const DISCLAIMER =
  'Approximate — derived from moon phase only, not a real tide table. Verify exact tide times before diving, boating or beach camping.'

// Known new moon reference: 2000-01-06 18:14 UTC. Synodic month ≈ 29.53059 days.
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14)
const SYNODIC_MONTH_DAYS = 29.530588853

export function moonPhase(date: Date): number {
  const diffDays = (date.getTime() - REFERENCE_NEW_MOON_MS) / (1000 * 60 * 60 * 24)
  const phase = (diffDays % SYNODIC_MONTH_DAYS) / SYNODIC_MONTH_DAYS
  return phase < 0 ? phase + 1 : phase
}

export function estimateTide(isoDate: string): TideEstimate {
  const date = new Date(`${isoDate}T12:00:00Z`)
  const phase = moonPhase(date)

  // Distance from nearest new (0/1) or full (0.5) moon, in phase-units [0, 0.25]
  const distFromSyzygy = Math.min(
    Math.abs(phase - 0),
    Math.abs(phase - 0.5),
    Math.abs(phase - 1),
  )

  let rangeCategory: TideRangeCategory
  let label: string
  if (distFromSyzygy < 0.06) {
    rangeCategory = 'spring'
    label = 'Spring tide — larger range, stronger currents'
  } else if (distFromSyzygy > 0.19) {
    rangeCategory = 'neap'
    label = 'Neap tide — smaller range, gentler currents'
  } else {
    rangeCategory = 'intermediate'
    label = 'Intermediate tidal range'
  }

  return { date: isoDate, moonPhase: phase, rangeCategory, label, disclaimer: DISCLAIMER }
}
