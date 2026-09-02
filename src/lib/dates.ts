export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysUntil(iso: string): number {
  const today = new Date(`${todayIso()}T00:00:00`)
  const target = new Date(`${iso}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
