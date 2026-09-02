import { useEffect, useState, type ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { campsites } from '../data/campsites'
import { activitySites } from '../data/activitySites'
import { findRegion } from '../data/regions'
import { CAMPING_LABELS } from '../data/activityMeta'
import { CONFIDENCE_LABEL } from '../lib/confidence'
import { isInCart, toggleCart, type CartKind } from '../lib/customTripCart'

export function SiteDetailPage() {
  const { kind, id } = useParams<{ kind: string; id: string }>()
  const [inCart, setInCart] = useState(false)

  const campsite = kind === 'campsite' ? campsites.find((c) => c.id === id) : undefined
  const site = kind === 'activity' ? activitySites.find((s) => s.id === id) : undefined
  const region = findRegion((campsite ?? site)?.regionId ?? '')

  useEffect(() => {
    if (kind && id) setInCart(isInCart(kind as CartKind, id))
  }, [kind, id])

  if (!campsite && !site) {
    return (
      <div className="space-y-4">
        <Link to="/explore" className="text-sm font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2">
          ← Back to Explore
        </Link>
        <Card className="p-8 text-center text-sm text-ink-500">Site not found.</Card>
      </div>
    )
  }

  const handleToggleCart = () => {
    if (!kind || !id) return
    toggleCart(kind as CartKind, id)
    setInCart(isInCart(kind as CartKind, id))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/explore" className="text-sm font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2">
        ← Back to Explore
      </Link>

      {campsite && (
        <>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">{campsite.name}</h1>
            {region && (
              <Link to="/explore" className="text-sm text-ink-500">
                📍 {region.name}
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>🏕 {CAMPING_LABELS[campsite.campingType] ?? campsite.campingType}</Badge>
            <Badge>🚙 {campsite.accessType.replace(/-/g, ' ')}</Badge>
            <Badge tone={campsite.dogPolicy === 'prohibited' ? 'warn' : 'good'}>🐕 {campsite.dogPolicy.replace(/-/g, ' ')}</Badge>
            <Badge tone="neutral">{CONFIDENCE_LABEL[campsite.confidence]}</Badge>
          </div>

          <Card className="p-5 space-y-3">
            <Row label="Fees" value={`💰 ${campsite.feesAud}`} />
            {campsite.bookingUrl && (
              <Row
                label="Booking"
                value={
                  <a href={campsite.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline decoration-teal-800/30 underline-offset-2">
                    Book →
                  </a>
                }
              />
            )}
            <Row label="Land manager" value={campsite.landManager} />
            <Row label="Facilities" value={campsite.facilities.join(', ')} />
            <Row label="Mobile reception" value={campsite.mobileReception} />
            {campsite.maxStayNights && <Row label="Max stay" value={`${campsite.maxStayNights} nights`} />}
            {campsite.notes && <Row label="Notes" value={campsite.notes} />}
            <Row
              label="Source"
              value={`${campsite.source} · verified ${campsite.lastVerified}`}
            />
          </Card>
        </>
      )}

      {site && (
        <>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">{site.name}</h1>
            {region && (
              <Link to="/explore" className="text-sm text-ink-500">
                📍 {region.name}
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{site.type}</Badge>
            <Badge>{site.entry} entry</Badge>
            <Badge>{site.difficulty}</Badge>
            <Badge tone={site.dogPolicy === 'prohibited' ? 'warn' : 'good'}>🐕 {site.dogPolicy.replace(/-/g, ' ')}</Badge>
            <Badge tone="neutral">{CONFIDENCE_LABEL[site.confidence]}</Badge>
          </div>

          <Card className="p-5 space-y-3">
            {site.costAud && <Row label="Cost" value={`💰 ${site.costAud}`} />}
            {site.bookingUrl && (
              <Row
                label="Booking"
                value={
                  <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline decoration-teal-800/30 underline-offset-2">
                    Book →
                  </a>
                }
              />
            )}
            {site.bestWindDirection && <Row label="Best wind" value={site.bestWindDirection} />}
            {site.bestTide && <Row label="Best tide" value={site.bestTide} />}
            {site.marineLife && site.marineLife.length > 0 && <Row label="Marine life" value={site.marineLife.join(', ')} />}
            {site.hazards && site.hazards.length > 0 && (
              <Row label="Hazards" value={<span className="text-terracotta-600">{site.hazards.join('; ')}</span>} />
            )}
            {site.distanceFromParkingM && <Row label="From parking" value={`${site.distanceFromParkingM}m`} />}
            {site.notes && <Row label="Notes" value={site.notes} />}
            <Row label="Source" value={`${site.source} · verified ${site.lastVerified}`} />
          </Card>
        </>
      )}

      <Button className="w-full" variant={inCart ? 'secondary' : 'primary'} onClick={handleToggleCart}>
        {inCart ? '✓ Added to Custom Trip — remove' : '+ Add to Custom Trip'}
      </Button>
      {inCart && (
        <Link to="/plan?tab=custom">
          <Button className="w-full" variant="ghost">
            View Custom Trip →
          </Button>
        </Link>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</dt>
      <dd className="text-sm text-ink-700">{value}</dd>
    </div>
  )
}
