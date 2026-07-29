import { accentTheme, c } from '@/lib/theme'
import type { Plan } from '@/lib/types'
import { useApp } from '@/state/store'

interface PlanCardProps {
  plan: Plan
  /** The paywall renders a tighter version of the same card. */
  compact?: boolean
  /** Paywall context trims the feature list so the whole modal fits without scrolling. */
  maxFeatures?: number
}

export function PlanCard({ plan, compact = false, maxFeatures }: PlanCardProps) {
  const { chosenPlan, choosePlan, money } = useApp()
  const t = accentTheme('light')
  const isCurrent = chosenPlan === plan.id
  const features = maxFeatures ? plan.features.slice(0, maxFeatures) : plan.features
  const highlight = plan.badge

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 10 : 12,
        padding: compact ? 20 : 28,
        borderRadius: compact ? 18 : 22,
        background: t.cardBg,
        border: `1px solid ${highlight ? c.primary : t.cardBorder}`,
        boxShadow: highlight ? '0 14px 34px -22px rgba(212,38,79,.35)' : t.cardShadow,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 22 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: t.eyebrowColor,
          }}
        >
          {plan.eyebrow}
        </span>
        {plan.badge && (
          <span
            style={{
              padding: '3px 9px',
              borderRadius: 5,
              background: c.yellow,
              color: c.navy,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Most chosen
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: compact ? 19 : 24,
          fontWeight: 600,
          color: t.titleColor,
          lineHeight: 1.2,
        }}
      >
        {plan.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontSize: compact ? 28 : 40,
            fontWeight: 600,
            letterSpacing: compact ? -0.8 : -1.2,
            color: t.titleColor,
          }}
        >
          {plan.price === 0 ? 'Free' : money(plan.price)}
        </span>
        {plan.price !== 0 && (
          <span style={{ fontSize: compact ? 13 : 14, color: t.subColor }}>{plan.unit}</span>
        )}
      </div>

      {!compact && (
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: t.bodyColor }}>{plan.blurb}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 7 : 9, marginTop: 4 }}>
        {features.map((feature) => (
          <div
            key={feature}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              fontSize: compact ? 13 : 14,
              lineHeight: 1.5,
              color: t.bodyColor,
            }}
          >
            <span style={{ flex: 'none', color: t.checkColor, fontWeight: 700 }}>✓</span>
            {feature}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => choosePlan(plan.id)}
        style={{
          marginTop: 'auto',
          height: compact ? 40 : 46,
          border: 'none',
          borderRadius: 8,
          background: highlight ? c.primary : t.btnBg,
          color: highlight ? '#fff' : t.btnColor,
          fontSize: compact ? 13.5 : 15,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {isCurrent ? 'Current plan' : plan.cta}
      </button>
    </div>
  )
}
