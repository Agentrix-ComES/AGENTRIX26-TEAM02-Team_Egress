import { Icon } from '@/components/ui/Icon'
import { PlanCard } from '@/components/ui/PlanCard'
import { PLANS } from '@/data/content'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

/** Interrupts the third-or-so AI action once the trial allowance runs out. */
export function PaywallModal() {
  const { paywallOpen, closePaywall, planName, trialDay } = useApp()

  if (!paywallOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose an AI plan"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(13,13,17,.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <div
        className="cs-scroll"
        style={{
          width: '100%',
          maxWidth: 940,
          maxHeight: '94vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: 22,
          boxShadow: '0 40px 90px -40px rgba(13,13,17,.6)',
          animation: 'csRise .3s ease both',
        }}
      >
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <span style={{ display: 'flex', color: c.primary }}>
                <Icon name="AutoMode" size={18} />
              </span>
              <span
                style={{
                  padding: '4px 11px',
                  borderRadius: 999,
                  background: c.primaryTint,
                  color: c.primaryHover,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {planName ? `${planName} active` : '7-day free trial · no card charged'}
              </span>
            </div>
            <h2
              style={{
                marginBottom: 6,
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: -0.6,
                lineHeight: 1.15,
                color: c.ink,
              }}
            >
              Keep the AI travel agent working for you.
            </h2>
            <p style={{ maxWidth: 620, fontSize: 14, lineHeight: 1.55, color: c.body }}>
              Planning and booking with the AI is always free — you only pay to turn on the live
              trip companion and the hands-free voice guide.
            </p>
          </div>
          <button
            type="button"
            onClick={closePaywall}
            aria-label="Close"
            style={{
              flex: 'none',
              width: 32,
              height: 32,
              border: 'none',
              borderRadius: 9,
              background: c.muted,
              color: c.body,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div
          data-grid="three-up"
          style={{
            padding: '18px 28px 4px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 14,
          }}
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} compact maxFeatures={4} />
          ))}
        </div>

        <div style={{ padding: '14px 28px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '13px 16px',
              borderRadius: 12,
              background: c.page,
              border: `1px solid ${c.line}`,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 13, color: c.body }}>
              Trial day {trialDay} of 7 — cancel any time, nothing is charged until it ends.
            </span>
            <button
              type="button"
              onClick={closePaywall}
              data-hover="text"
              style={{
                marginLeft: 'auto',
                border: 'none',
                background: 'transparent',
                color: c.textMuted,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Continue on trial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
