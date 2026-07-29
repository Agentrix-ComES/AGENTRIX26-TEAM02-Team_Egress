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
          maxWidth: 1020,
          maxHeight: '88vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 40px 90px -40px rgba(13,13,17,.6)',
          animation: 'csRise .3s ease both',
        }}
      >
        <div style={{ padding: '32px 36px 0', display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
              <span style={{ display: 'flex', color: c.primary }}>
                <Icon name="AutoMode" size={20} />
              </span>
              <span
                style={{
                  padding: '4px 11px',
                  borderRadius: 999,
                  background: c.greenTint,
                  color: c.greenInk,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {planName ? `${planName} active` : '7-day free trial · no card charged'}
              </span>
            </div>
            <h2
              style={{
                marginBottom: 10,
                fontSize: 32,
                fontWeight: 500,
                letterSpacing: -0.8,
                lineHeight: 1.12,
                color: c.ink,
              }}
            >
              Keep the AI travel agent working for you.
            </h2>
            <p style={{ maxWidth: 620, fontSize: 15.5, lineHeight: 1.65, color: c.body }}>
              Your 7-day trial covers everything below. Booking stays, activities and packages is
              always free — you only pay for the AI planner, the live trip companion and the voice
              guide.
            </p>
          </div>
          <button
            type="button"
            onClick={closePaywall}
            aria-label="Close"
            style={{
              flex: 'none',
              width: 34,
              height: 34,
              border: 'none',
              borderRadius: 9,
              background: c.muted,
              color: c.body,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div
          data-grid="three-up"
          style={{
            padding: '26px 36px 12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 18,
          }}
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} compact />
          ))}
        </div>

        <div style={{ padding: '12px 36px 32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 18px',
              borderRadius: 14,
              background: c.page,
              border: `1px solid ${c.line}`,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 13.5, color: c.body }}>
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
                fontSize: 13.5,
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
