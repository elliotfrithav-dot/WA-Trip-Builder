// Real, freely-licensed marine-life and coastline photography, placed as
// soft-edged, muted accents fixed behind all page content. Kept at low
// opacity/desaturated so text stays highly legible over it — this is meant
// to be felt, not read.
//
// Image credits (Wikimedia Commons):
//  - Dolphin: NASA (public domain)
//  - Whale: Brigitte Werner / Pixabay (CC0)
//  - Turtle: US Fish & Wildlife Service (public domain)
//  - Reef fish: US Fish & Wildlife Service (public domain)
//  - Sea lion (Neophoca cinerea): Brian M. Hunt (CC BY-SA 3.0 / GFDL) — attribution required
//  - Beach (Hamelin Bay, WA): released to the public domain by the author
import dolphin from '../../assets/marine/dolphin.jpg'
import whale from '../../assets/marine/whale.jpg'
import turtle from '../../assets/marine/turtle.jpg'
import reefFish from '../../assets/marine/reef-fish.jpg'
import seaLion from '../../assets/marine/sea-lion.jpg'
import beach from '../../assets/marine/beach.jpg'

interface Blob {
  src: string
  top: string
  left?: string
  right?: string
  size: number
  opacity: number
}

const BLOBS: Blob[] = [
  { src: whale, top: '2%', left: '-6%', size: 420, opacity: 0.16 },
  { src: turtle, top: '18%', right: '-8%', size: 340, opacity: 0.16 },
  { src: reefFish, top: '46%', left: '-10%', size: 380, opacity: 0.14 },
  { src: dolphin, top: '62%', right: '-6%', size: 360, opacity: 0.16 },
  { src: beach, top: '82%', left: '-8%', size: 420, opacity: 0.14 },
  { src: seaLion, top: '96%', right: '-8%', size: 340, opacity: 0.16 },
]

export function OceanBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream-100">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full grayscale"
          style={{
            top: b.top,
            left: b.left,
            right: b.right,
            width: b.size,
            height: b.size,
            backgroundImage: `url(${b.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: b.opacity,
            maskImage: 'radial-gradient(closest-side, black 55%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(closest-side, black 55%, transparent 100%)',
            mixBlendMode: 'multiply',
          }}
        />
      ))}
    </div>
  )
}
