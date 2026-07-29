import { c } from '@/lib/theme'

/**
 * Photo placeholder, standing in for the design tool's <image-slot>.
 *
 * Drop a real photo in by adding the slot id to IMAGES below — every call site
 * already passes one, so no component changes are needed.
 */
const IMAGES: Record<string, string> = {
  // 'v4-hero': '/images/hero-coastline.jpg',
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
