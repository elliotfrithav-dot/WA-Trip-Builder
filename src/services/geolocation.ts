export interface GeoPoint {
  lat: number
  lng: number
}

/** Resolves to the browser's current location, or null if unavailable/denied/timed out. */
export function getCurrentLocation(timeoutMs = 8000): Promise<GeoPoint | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null)
      return
    }
    const timer = setTimeout(() => resolve(null), timeoutMs)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        clearTimeout(timer)
        resolve(null)
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 },
    )
  })
}
