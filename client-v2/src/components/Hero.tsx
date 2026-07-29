import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { c } from '@/lib/theme'

const HERO_PHOTOS = [
  '/images/hero/hero.jpg',
  '/images/hero/hero2.webp',
  '/images/hero/pexels-srkportraits-10710560.jpg',
  '/images/hero/pexels-batagov-29813525.jpg',
  '/images/hero/pexels-batagov-29644514.jpg',
  '/images/hero/pexels-aztec92-19287633.jpg',
  '/images/hero/Angampora.jpg',
  '/images/hero/download.jpg',
  '/images/hero/download%20(2).jpg',
  '/images/hero/download%20(3).jpg',
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

export function Hero() {
  return (
    <section id="top" style={{ padding: '28px 0 0' }}>
      <div
        style={{
          // Full-bleed: breaks out of the centered page column to span the
          // whole viewport width, however wide the screen gets.
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
          position: 'relative',
          // Fixed 560px on the desktop canvas; grows to fit once the type shrinks.
          minHeight: 'clamp(460px, 42vw, 560px)',
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

        <div
          style={{
            position: 'relative',
            minHeight: 'inherit',
            minWidth: 0,
            maxWidth: 'var(--page-max)',
            margin: '0 auto',
            padding: 'clamp(22px, 4vw, 56px) var(--page-pad)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 22,
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
              justifyContent: 'space-between',
              gap: 40,
              flexWrap: 'wrap',
              minWidth: 0,
            }}
          >
            <p
              style={{
                maxWidth: 480,
                minWidth: 0,
                fontSize: 'clamp(15px, 1.5vw, 18px)',
                lineHeight: 1.55,
                color: 'rgba(255,255,255,.88)',
              }}
            >
              Search and add to cart like any travel site — or hand it to the agent, which builds
              the itinerary, watches the weather and news while you travel, and tells you what to
              change.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
              <span
                style={{
                  padding: '9px 16px',
                  borderRadius: 999,
                  background: c.yellow,
                  color: c.navy,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                7-day AI trial
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
