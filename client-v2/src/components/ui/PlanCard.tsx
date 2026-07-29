import { accentTheme, c } from '@/lib/theme'
import type { Plan } from '@/lib/types'
import { useApp } from '@/state/store'

interface PlanCardProps {
  plan: Plan
  /** The paywall renders a tighter version of the same card. */
  compact?: boolean
}

export function PlanCard({ plan, compact = false }: PlanCardProps) {
  const { chosenPlan, choosePlan, money } = useApp()
  const t = accentTheme(plan.accent)
  const isCurrent = chosenPlan === plan.id

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: compact ? 24 : 28,
        borderRadius: compact ? 20 : 22,
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        boxShadow: t.cardShadow,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 24 }}>
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
          fontSize: compact ? 22 : 24,
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
            fontSize: compact ? 34 : 40,
            fontWeight: 600,
            letterSpacing: compact ? -1 : -1.2,
            color: t.titleColor,
          }}
        >
          {money(plan.price)}
        </span>
        <span style={{ fontSize: compact ? 13.5 : 14, color: t.subColor }}>{plan.unit}</span>
      </div>

      <p style={{ fontSize: compact ? 14 : 14.5, lineHeight: 1.6, color: t.bodyColor }}>
        {plan.blurb}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 9, marginTop: 4 }}>
        {plan.features.map((feature) => (
          <div
            key={feature}
            style={{
              display: 'flex',
              gap: 9,
              alignItems: 'flex-start',
              fontSize: compact ? 13.5 : 14,
              lineHeight: 1.55,
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
          height: compact ? 44 : 46,
          border: 'none',
          borderRadius: 8,
          background: t.btnBg,
          color: t.btnColor,
          fontSize: compact ? 14.5 : 15,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {isCurrent ? 'Current plan' : plan.cta}
      </button>
    </div>
  )
}
