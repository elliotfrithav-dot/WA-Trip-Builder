import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getCurrentLocation, type GeoPoint } from '../../services/geolocation'
import { fetchDrivingRoute, type RouteResult } from '../../services/routing'
import { PERTH } from '../../data/regions'
import { formatDriveTime } from '../../services/distance'

function pinIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));transform:translate(-50%,-90%)">${emoji}</div>`,
    className: '',
    iconSize: [0, 0],
  })
}

function FitToRoute({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (coordinates.length > 1) {
      map.fitBounds(coordinates, { padding: [32, 32] })
    }
  }, [coordinates, map])
  return null
}

interface RouteMapProps {
  destination: { lat: number; lng: number; name: string }
}

export function RouteMap({ destination }: RouteMapProps) {
  const [origin, setOrigin] = useState<GeoPoint | null>(null)
  const [usingGps, setUsingGps] = useState(false)
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const gps = await getCurrentLocation()
      const start = gps ?? PERTH
      if (cancelled) return
      setOrigin(start)
      setUsingGps(Boolean(gps))
      const result = await fetchDrivingRoute(start, destination)
      if (!cancelled) {
        setRoute(result)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination.lat, destination.lng])

  if (loading || !origin || !route) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-cream-300/70 bg-cream-50 text-sm text-ink-500">
        Locating you and building the route…
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-cream-300/70">
      <MapContainer
        center={[origin.lat, origin.lng]}
        zoom={9}
        style={{ height: '320px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
        <Polyline
          positions={route.coordinates}
          pathOptions={{
            color: '#c1622d',
            weight: 4,
            opacity: 0.9,
            dashArray: route.approximate ? '8 8' : undefined,
          }}
        />
        <Marker position={[origin.lat, origin.lng]} icon={pinIcon('📍')} />
        <Marker position={[destination.lat, destination.lng]} icon={pinIcon('🏁')} />
        <FitToRoute coordinates={route.coordinates} />
      </MapContainer>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-cream-50 px-4 py-2 text-xs text-ink-500">
        <span>{usingGps ? '📍 Route from your current location' : '📍 Route from Perth — location unavailable'}</span>
        <span>
          {route.approximate
            ? 'Straight-line only — live routing unavailable, verify your route'
            : `${Math.round(route.distanceKm)}km · ${formatDriveTime(route.durationMin)} estimated`}
        </span>
      </div>
    </div>
  )
}
