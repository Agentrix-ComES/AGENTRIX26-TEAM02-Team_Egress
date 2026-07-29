import { c } from '@/lib/theme'

/**
 * Photo placeholder, standing in for the design tool's <image-slot>.
 *
 * Drop a real photo in by adding the slot id to IMAGES below — every call site
 * already passes one, so no component changes are needed.
 */
const IMAGES: Record<string, string> = {
  'v4-act1': '/images/activites/leopard.jpg',
  'v4-act2': '/images/hotels/nine-arches-bridge.jpg',
  'v4-act4': '/images/activites/surfing.jpg',
  'v4-act6': '/images/activites/gallefort.jpg',
  'v4-act8': '/images/activites/dambulla-temple.jpg',
  'v4-act9': '/images/activites/hot-air-balloon-dambulla.webp',
  'v4-act3': '/images/activites/sigiriya.jpg',
  'v4-act5': '/images/activites/whale-watching.webp',
  'v4-act10': '/images/activites/waterfalls-talawakale.jpg',
  'v4-act11': '/images/activites/white-water-rafting.jpg',
  'v4-act12': '/images/activites/ayurveda-wellness.jpg',
  'v4-act13': '/images/activites/yala-safari-crocodile.jpg',
  'v4-stay1': '/images/hotels/weligama-bay-marriott.webp',
  'v4-stay2': '/images/hotels/98-acres-resort.webp',
  'v4-stay3': '/images/hotels/cinnamon-citadel-kandy.webp',
  'v4-stay4': '/images/hotels/ugaprava.webp',
  'v4-stay5': '/images/hotels/heritence-kandalama.webp',
  'v4-stay6': '/images/hotels/jetwing-lake.webp',
  'v4-pkg1': '/images/packages/white-water-rafting.jpg',
  'v4-pkg2': '/images/packages/98-acres-resort.webp',
  'v4-pkg3': '/images/packages/yala-safari-crocodile.jpg',
  'v4-pkg4': '/images/packages/jetwing-lake.webp',
  'v4-pkg5': '/images/packages/pexels-aztec92-19287633.jpg',
  'v4-trn1': '/images/transport/private-driver-car.jpg',
  'v4-trn2': '/images/transport/train.jpg',
  'v4-trn3': '/images/transport/cab-airport.jpg',
  'v4-trn4': '/images/transport/TukTuk.jpg',
  'v4-trn5': '/images/transport/airport.jpg',
  'v4-trn6': '/images/transport/tourist-bus.jpg',
  'v4-trn7': '/images/transport/tourist-bus2.jpg',
  'v4-trn8': '/images/transport/seaplane.jpg',
}

/** Deterministic tint per slot so the page isn't a wall of identical grey. */
const TINTS = [
  'linear-gradient(140deg,#dbeaf2 0%,#c6dbe8 100%)',
  'linear-gradient(140deg,#e8e2da 0%,#d8cfc3 100%)',
  'linear-gradient(140deg,#dce8e2 0%,#c4dbd1 100%)',
  'linear-gradient(140deg,#eadfe3 0%,#dcc9d0 100%)',
]

function tintFor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 997
  return TINTS[hash % TINTS.length]
}

interface ImageSlotProps {
  id: string
  placeholder: string
  radius?: number
  /** Overrides the IMAGES registry for one-off images. */
  src?: string
  /**
   * Pins the hint to a corner instead of centring it. Use on large slots that
   * sit behind text (the hero), where a centred label collides with the copy.
   */
  corner?: boolean
}

export function ImageSlot({ id, placeholder, radius = 0, src, corner = false }: ImageSlotProps) {
  const resolved = src ?? IMAGES[id]

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={placeholder}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          borderRadius: radius || undefined,
        }}
      />
    )
  }

  return (
    <div
      data-image-slot={id}
      title={placeholder}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: corner ? 'flex-end' : 'center',
        justifyContent: corner ? 'flex-end' : 'center',
        padding: 14,
        textAlign: corner ? 'right' : 'center',
        background: corner ? 'transparent' : tintFor(id),
        borderRadius: radius || undefined,
        color: 'rgba(39,42,70,.55)',
        fontSize: 12.5,
        lineHeight: 1.45,
        fontWeight: 500,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          maxWidth: corner ? 220 : undefined,
          padding: corner ? '6px 10px' : undefined,
          borderRadius: corner ? 8 : undefined,
          background: corner ? 'rgba(255,255,255,.72)' : undefined,
          textShadow: corner ? undefined : `0 1px 0 ${c.card}`,
        }}
      >
        {placeholder}
      </span>
    </div>
  )
}
