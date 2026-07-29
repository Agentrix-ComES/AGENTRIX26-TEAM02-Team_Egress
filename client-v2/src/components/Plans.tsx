import { PlanCard } from '@/components/ui/PlanCard'
import { Section, SectionAside, SectionHead } from '@/components/ui/Section'
import { PLANS } from '@/data/content'
import { c } from '@/lib/theme'

export function Plans() {
  return (
    <Section id="plans">
      <SectionHead
        eyebrow="AI plans"
        title="Planning is free. The live companion is a subscription."
        marginBottom={14}
        aside={
          <SectionAside maxWidth={380}>
            The AI planner is free forever. Add the live trip companion or voice guide when you
            want the agent watching and running the trip for you.
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
