import { useLocation } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { AGENT_JOBS } from '@/data/content'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

/**
 * The AI tour guide's "add me to the trip" popup — same slide-in panel
 * chrome as VoiceGuide's chat, but anchored to the left so it never
 * collides with that chat on the right. Lives only on the AI search page:
 * opened either from its own button there, or automatically once the
 * traveller checks out (see CartDrawer).
 */
export function TourGuidePanel() {
  const app = useApp()
  const location = useLocation()

  if (location.pathname !== '/search' || !app.tourGuideOpen) return null

  return (
    <div
      role="dialog"
      aria-label="AI tour guide"
      style={{
        position: 'fixed',
        top: 'var(--header-h)',
        left: 0,
        bottom: 0,
        zIndex: 35,
        width: 420,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: c.darkTeal,
        borderRight: '1px solid rgba(255,255,255,.1)',
        boxShadow: '24px 0 60px -30px rgba(39,42,70,.35)',
        overflow: 'hidden',
        animation: 'csSlideInLeft .28s cubic-bezier(.2,.8,.2,1) both',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          padding: '20px 22px',
          borderBottom: '1px solid rgba(255,255,255,.09)',
          flex: 'none',
        }}
      >
        <span style={{ position: 'relative', width: 42, height: 42, flex: 'none' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: c.darkCard,
              color: c.green,
              boxShadow: '0 6px 16px -6px rgba(0,197,128,.5)',
            }}
          >
            <Icon name="Shield" size={20} />
          </span>
          {app.companionOn && (
            <span
              style={{
                position: 'absolute',
                right: -1,
                bottom: -1,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: c.green,
                border: `2px solid ${c.darkTeal}`,
              }}
            />
          )}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: '#fff' }}>AI tour guide</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.55)' }}>
            {app.companionOn ? 'Watching this trip day by day' : 'Not monitoring yet'}
          </div>
        </div>
        <button
          type="button"
          onClick={app.closeTourGuide}
          aria-label="Close AI tour guide"
          data-hover="light-strong"
          style={{
            width: 32,
            height: 32,
            border: '1px solid rgba(255,255,255,.22)',
            borderRadius: 9,
            background: 'transparent',
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer',
            flex: 'none',
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div
        className="cs-scroll"
        style={{ flex: '1 1 auto', overflowY: 'auto', padding: '20px 22px' }}
      >
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,.72)', marginBottom: 20 }}>
          Once you're on the ground, this plan stops being a document. Turn on the guide and it
          keeps checking weather, routes, bookings and safety for you — and only messages you when
          something needs a decision.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {AGENT_JOBS.slice(0, 4).map((job) => (
            <div key={job.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span
                style={{
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: job.bg,
                  color: job.color,
                }}
              >
                <Icon name={job.icon} size={15} />
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{job.title}</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'rgba(255,255,255,.55)' }}>
                  {job.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / CTA */}
      <div
        style={{
          padding: '18px 22px',
          borderTop: '1px solid rgba(255,255,255,.09)',
          flex: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {app.companionOn ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 46,
              padding: '0 16px',
              borderRadius: 8,
              background: 'rgba(0,197,128,.14)',
              color: c.green,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Icon name="CheckCircle" size={17} />
            Guide is active for this trip
          </div>
        ) : (
          <button
            type="button"
            onClick={app.activateCompanion}
            data-hover="primary"
            style={{
              height: 46,
              border: 'none',
              borderRadius: 8,
              background: c.primary,
              color: '#fff',
              fontSize: 14.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Activate AI tour guide
          </button>
        )}
        <p style={{ fontSize: 11.5, lineHeight: 1.5, color: 'rgba(255,255,255,.45)' }}>
          Free to try — every check is logged and every change is reversible.
        </p>
      </div>
    </div>
  )
}
