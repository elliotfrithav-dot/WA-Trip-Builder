import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { regions, PERTH } from '../../data/regions'
import { campsites } from '../../data/campsites'
import { activitySites } from '../../data/activitySites'
import { CONFIDENCE_LABEL } from '../../lib/confidence'
import type { ActivitySiteType } from '../../data/types'
import 'leaflet/dist/leaflet.css'

const ICONS: Record<string, string> = {
  region: '📍',
  campsite: '🏕',
  dive: '🤿',
  snorkel: '🤿',
  hike: '🥾',
  beach: '🏖',
  perth: '🏙',
}

function emojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:20px;line-height:1;transform:translate(-50%,-50%)">${emoji}</div>`,
    className: '',
    iconSize: [0, 0],
  })
}

export interface MapLayerVisibility {
  campsites: boolean
  dive: boolean
  snorkel: boolean
  hike: boolean
  beach: boolean
}

export const DEFAULT_LAYERS: MapLayerVisibility = {
  campsites: true,
  dive: true,
  snorkel: true,
  hike: true,
  beach: true,
}

interface MapViewProps {
  highlightedRegionId?: string
  height?: string
  /** When provided, only these regions (and their sites) are shown — used by Explore's filters. */
  visibleRegionIds?: string[]
  layers?: MapLayerVisibility
  /** Hides the Perth marker and fits tightly to the shown region(s) + sites, instead of the whole state — used by the region detail page's localised map. */
  standalone?: boolean
}

const TYPE_LAYER_KEY: Record<ActivitySiteType, keyof MapLayerVisibility> = {
  dive: 'dive',
  snorkel: 'snorkel',
  hike: 'hike',
  beach: 'beach',
}

function FitToRegions({ points }: { points: [number, number][] }) {
  const map = useMap()
  const key = points.map((p) => p.join(',')).join('|')
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points, { padding: [24, 24] })
    } else if (points.length === 1) {
      map.setView(points[0], 9)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map])
  return null
}

export function MapView({ highlightedRegionId, height = '420px', visibleRegionIds, layers = DEFAULT_LAYERS, standalone = false }: MapViewProps) {
  const shownRegions = visibleRegionIds ? regions.filter((r) => visibleRegionIds.includes(r.id)) : regions
  const shownRegionIds = new Set(shownRegions.map((r) => r.id))

  const shownCampsites = layers.campsites ? campsites.filter((c) => shownRegionIds.has(c.regionId)) : []
  const shownSites = activitySites.filter((s) => shownRegionIds.has(s.regionId) && layers[TYPE_LAYER_KEY[s.type]])

  const fitPoints: [number, number][] = standalone
    ? [
        ...shownRegions.map((r): [number, number] => [r.lat, r.lng]),
        ...shownCampsites.map((c): [number, number] => [c.lat, c.lng]),
        ...shownSites.map((s): [number, number] => [s.lat, s.lng]),
      ]
    : [[PERTH.lat, PERTH.lng], ...shownRegions.map((r): [number, number] => [r.lat, r.lng])]

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-cream-300/70">
      <MapContainer center={[-27, 118]} zoom={5} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToRegions points={fitPoints} />
        {!standalone && (
          <Marker position={[PERTH.lat, PERTH.lng]} icon={emojiIcon(ICONS.perth)}>
            <Popup>Perth (start location)</Popup>
          </Marker>
        )}
        {shownRegions.map((r) => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={emojiIcon(r.id === highlightedRegionId ? '⭐' : ICONS.region)}
          >
            <Popup>
              <strong>{r.name}</strong>
              <br />
              {r.blurb}
            </Popup>
          </Marker>
        ))}
        {shownCampsites.map((c) => (
          <Marker key={c.id} position={[c.lat, c.lng]} icon={emojiIcon(ICONS.campsite)}>
            <Popup>
              <strong>{c.name}</strong>
              <br />
              {c.campingType.replace(/-/g, ' ')}
              <br />
              💰 {c.feesAud}
              {c.bookingUrl && (
                <>
                  <br />
                  <a href={c.bookingUrl} target="_blank" rel="noopener noreferrer">
                    Book →
                  </a>
                </>
              )}
              <br />
              <span style={{ fontSize: '0.75em', opacity: 0.75 }}>{CONFIDENCE_LABEL[c.confidence]}</span>
              <br />
              <Link to={`/site/campsite/${c.id}`}>View full details →</Link>
            </Popup>
          </Marker>
        ))}
        {shownSites.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={emojiIcon(ICONS[s.type])}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.type} · {s.difficulty}
              {s.costAud && (
                <>
                  <br />
                  💰 {s.costAud}
                </>
              )}
              {s.bookingUrl && (
                <>
                  <br />
                  <a href={s.bookingUrl} target="_blank" rel="noopener noreferrer">
                    Book →
                  </a>
                </>
              )}
              <br />
              <span style={{ fontSize: '0.75em', opacity: 0.75 }}>{CONFIDENCE_LABEL[s.confidence]}</span>
              <br />
              <Link to={`/site/activity/${s.id}`}>View full details →</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
