import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { regions, PERTH } from '../../data/regions'
import { campsites } from '../../data/campsites'
import { activitySites } from '../../data/activitySites'
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
}

const TYPE_LAYER_KEY: Record<ActivitySiteType, keyof MapLayerVisibility> = {
  dive: 'dive',
  snorkel: 'snorkel',
  hike: 'hike',
  beach: 'beach',
}

export function MapView({ highlightedRegionId, height = '420px', visibleRegionIds, layers = DEFAULT_LAYERS }: MapViewProps) {
  const shownRegions = visibleRegionIds ? regions.filter((r) => visibleRegionIds.includes(r.id)) : regions
  const shownRegionIds = new Set(shownRegions.map((r) => r.id))

  const shownCampsites = layers.campsites ? campsites.filter((c) => shownRegionIds.has(c.regionId)) : []
  const shownSites = activitySites.filter((s) => shownRegionIds.has(s.regionId) && layers[TYPE_LAYER_KEY[s.type]])

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-cream-300/70">
      <MapContainer center={[-32.2, 115.5]} zoom={7} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[PERTH.lat, PERTH.lng]} icon={emojiIcon(ICONS.perth)}>
          <Popup>Perth (start location)</Popup>
        </Marker>
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
            </Popup>
          </Marker>
        ))}
        {shownSites.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={emojiIcon(ICONS[s.type])}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.type} · {s.difficulty}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
