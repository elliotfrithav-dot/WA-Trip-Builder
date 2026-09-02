import { haversineKm } from './distance'
import type { GeoPoint } from './geolocation'

export interface RouteResult {
  /** [lat, lng] pairs. */
  coordinates: [number, number][]
  distanceKm: number
  durationMin: number
  /** true when this is a straight-line fallback, not a real driving route. */
  approximate: boolean
}

// OSRM's free public demo server (no key, fair-use only — fine for a
// personal single-user app, not for heavy/production traffic). If it's
// unavailable or rate-limited, fall back to a straight line so the map still
// shows something, clearly labeled as approximate.
const OSRM_ENDPOINT = 'https://router.project-osrm.org/route/v1/driving'

export async function fetchDrivingRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult> {
  try {
    const url = `${OSRM_ENDPOINT}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`)
    const json = await res.json()
    const route = json.routes?.[0]
    if (!route) throw new Error('No route returned')

    const coordinates: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng],
    )
    return {
      coordinates,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      approximate: false,
    }
  } catch {
    return {
      coordinates: [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ],
      distanceKm: haversineKm(origin, destination),
      durationMin: NaN,
      approximate: true,
    }
  }
}
