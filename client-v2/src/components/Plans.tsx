import { PlanCard } from '@/components/ui/PlanCard'
import { Section, SectionAside, SectionHead } from '@/components/ui/Section'
import { PLANS } from '@/data/content'
import { c } from '@/lib/theme'

export function Plans() {
  return (
    <Section id="plans">
      <SectionHead
        eyebrow="AI plans"
        title="Booking is free. The agent is a subscription."
        marginBottom={14}
        aside={
          <SectionAside maxWidth={380}>
            Start with 7 days free — full access, no card charged. After that pick the level that
            matches how much you want the agent doing.
          </SectionAside>
        }
      />

      <div
        data-grid="three-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 22,
          marginTop: 26,
        }}
      >
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: c.textSubtle }}>
        All plans include the live companion&apos;s safety alerts. Cancel any time; a booked trip
        keeps its companion until you fly home.
      </p>
    </Section>
  )
}
