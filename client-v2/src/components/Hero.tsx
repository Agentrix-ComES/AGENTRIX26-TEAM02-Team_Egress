import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

const HERO_PHOTOS = [
  '/images/hero/pexels-srkportraits-10710560.jpg',
  '/images/hero/pexels-batagov-29813525.jpg',
  '/images/hero/pexels-aztec92-19287633.jpg',
]
const HERO_ROTATE_MS = 6000

/** Crossfades through the hero photo set on a timer — no controls, purely ambient. */
function HeroPhotos() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_PHOTOS.length)
    }, HERO_ROTATE_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      {HERO_PHOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === index ? 1 : 0,
            transition: 'opacity 1.6s ease-in-out',
          }}
        />
      ))}
    </>
  )
}

interface HeroProps {
  /**
   * Set to `false` to render just the photo/gradient banner — no location
   * badge, headline, paragraph or CTAs. Used by pages (e.g. traditional
   * search) that only want the ambient image behind their own search bar;
   * the homepage keeps the default (`true`) unchanged.
   */
  content?: boolean
  /** Shorter banner for pages that aren't the homepage — same photos, less height. */
  compact?: boolean
  /** Rendered bottom-anchored inside the banner itself (e.g. a search bar), on top of the photo. */
  children?: ReactNode
}

export function Hero({ content = true, compact = false, children }: HeroProps) {
  const { openPaywall } = useApp()

  return (
    <section id="top" style={{ padding: 0 }}>
      <div
        style={{
          // Full-bleed: breaks out of the centered page column to span the
          // whole viewport width, however wide the screen gets.
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
          position: 'relative',
          // Fixed 560px on the desktop canvas; grows to fit once the type shrinks.
          // Compact pages (e.g. traditional search) get a noticeably shorter banner.
          minHeight: compact ? 'clamp(240px, 26vw, 340px)' : 'clamp(460px, 42vw, 560px)',
          overflow: 'hidden',
          background: `linear-gradient(140deg,${c.cyan} 0%,${c.cyanInk} 55%,${c.navy} 100%)`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <HeroPhotos />
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(105deg,rgba(13,13,17,.72) 0%,rgba(13,13,17,.34) 52%,rgba(1,161,210,.14) 100%)',
          }}
        />

        {content && (
        <div
          style={{
            position: 'relative',
            minHeight: 'inherit',
            minWidth: 0,
            // No page-max/auto-centering here on purpose: the hero copy should
            // always hug the true left edge of the viewport, not the centered
            // content column other sections use.
            padding: 'clamp(22px, 4vw, 56px) var(--page-pad)',
            display: 'flex',
            flexDirection: 'column',
            // space-between (not flex-end) so the location badge sits pinned
            // to the top of the hero, separate from the headline/paragraph
            // group anchored at the bottom.
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              alignSelf: 'flex-start',
              maxWidth: '100%',
              minWidth: 0,
              padding: '7px 15px 7px 11px',
              borderRadius: 999,
              background: 'rgba(255,255,255,.18)',
              border: '1px solid rgba(255,255,255,.35)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              backdropFilter: 'blur(4px)',
            }}
          >
            <Icon name="LocationOn" size={16} />
            <span style={{ minWidth: 0 }}>
              Sri Lanka · 1,400 stays · 620 activities · 48 packages
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0, marginBottom: 18 }}>
            <h1
              style={{
                maxWidth: 780,
                minWidth: 0,
                fontSize: 'clamp(30px, 5vw, 62px)',
                fontWeight: 500,
                lineHeight: 1.03,
                letterSpacing: '-0.032em',
                color: '#fff',
                textWrap: 'pretty',
              }}
            >
              Book it yourself, or let the AI agent plan and run the trip.
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                gap: 40,
                flexWrap: 'wrap',
                minWidth: 0,
              }}
            >
              <p
                style={{
                  flex: '1 1 260px',
                  maxWidth: 480,
                  minWidth: 0,
                  fontSize: 'clamp(15px, 1.5vw, 18px)',
                  lineHeight: 1.55,
                  color: 'rgba(255,255,255,.88)',
                }}
              >
                Search and add to cart like any travel site — or hand it to the agent, which
                builds the itinerary, watches the weather and news while you travel, and tells
                you what to change.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 'none', marginLeft: 'auto', justifyContent: 'flex-end' }}>
                <span
                  style={{
                    padding: '9px 16px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,.16)',
                    border: '1px solid rgba(255,255,255,.3)',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  Free cancellation
                </span>
                <button
                  type="button"
                  onClick={openPaywall}
                  className="cs-cta-glow"
                  style={{
                    padding: '9px 16px',
                    borderRadius: 999,
                    background: c.yellow,
                    color: c.navy,
                    fontSize: 14,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                  }}
                >
                  7-day AI trial
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {children && (
          <div
            style={{
              position: 'relative',
              minHeight: 'inherit',
              maxWidth: 1080,
              margin: '0 auto',
              padding: 'clamp(16px, 3vw, 28px) var(--page-pad)',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ width: '100%' }}>{children}</div>
          </div>
        )}
      </div>
    </section>
  )
}
