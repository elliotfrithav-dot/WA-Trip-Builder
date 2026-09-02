import type { SavedTrip } from '../features/trip-builder/types'

const KEY = 'wa-adventure.saved-trips.v1'

export function getSavedTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedTrip[]) : []
  } catch {
    return []
  }
}

export function saveTrip(trip: SavedTrip): void {
  const trips = getSavedTrips()
  localStorage.setItem(KEY, JSON.stringify([trip, ...trips]))
}

export function deleteTrip(id: string): void {
  const trips = getSavedTrips().filter((t) => t.id !== id)
  localStorage.setItem(KEY, JSON.stringify(trips))
}

export function updateTripPackingList(id: string, packingList: SavedTrip['packingList']): void {
  const trips = getSavedTrips().map((t) => (t.id === id ? { ...t, packingList } : t))
  localStorage.setItem(KEY, JSON.stringify(trips))
}
