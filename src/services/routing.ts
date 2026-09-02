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
// unavailable or rate-limited, fall back to straight lines between points so
// the map still shows something, clearly labeled as approximate.
const OSRM_ENDPOINT = 'https://router.project-osrm.org/route/v1/driving'

/** Fetches one driving route through an ordered sequence of 2+ points (origin, then any waypoints/stops). */
export async function fetchDrivingRoute(points: GeoPoint[]): Promise<RouteResult> {
  if (points.length < 2) {
    throw new Error('fetchDrivingRoute needs at least an origin and a destination')
  }
  try {
    const coordsParam = points.map((p) => `${p.lng},${p.lat}`).join(';')
    const url = `${OSRM_ENDPOINT}/${coordsParam}?overview=full&geometries=geojson`
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
    let distanceKm = 0
    for (let i = 0; i < points.length - 1; i++) distanceKm += haversineKm(points[i], points[i + 1])
    return {
      coordinates: points.map((p) => [p.lat, p.lng] as [number, number]),
      distanceKm,
      durationMin: NaN,
      approximate: true,
    }
  }
}
