import { Icon } from '@/components/ui/Icon'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { c } from '@/lib/theme'

export function Hero() {
  return (
    <section id="top" style={{ padding: '28px var(--page-pad) 0' }}>
      <div
        style={{
          maxWidth: 'var(--page-max)',
          margin: '0 auto',
          position: 'relative',
          // Fixed 560px on the desktop canvas; grows to fit once the type shrinks.
          minHeight: 'clamp(460px, 42vw, 560px)',
          borderRadius: 28,
          overflow: 'hidden',
          background: `linear-gradient(140deg,${c.cyan} 0%,${c.cyanInk} 55%,${c.navy} 100%)`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <ImageSlot
            corner
            id="v4-hero"
            placeholder="Drop the hero photo — coastline, tea country or a temple at golden hour"
          />
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
            padding: 'clamp(22px, 4vw, 56px)',
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
            Sri Lanka · 1,400 stays · 620 activities · 48 packages
          </div>

          <h1
            style={{
              maxWidth: 780,
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
            }}
          >
            <p
              style={{
                maxWidth: 480,
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
