import { Icon } from '@/components/ui/Icon'
import { Section, SectionAside, SectionHead } from '@/components/ui/Section'
import { PLANNER_CHECKS } from '@/data/catalogue'
import { parsePrice, plural } from '@/lib/money'
import { c, weatherStyle } from '@/lib/theme'
import type { Pace } from '@/lib/types'
import { useApp } from '@/state/store'

const PACES: Array<{ id: Pace; label: string }> = [
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'packed', label: 'Packed' },
]

export function Planner() {
  const app = useApp()
  const { plannerDays, plannerTotals, money } = app

  return (
    <Section id="planner" padding="0 var(--page-pad) 92px">
      <SectionHead
        eyebrow="AI trip planner"
        title="A day-by-day itinerary you can add to the cart."
        marginBottom={28}
        aside={
          <SectionAside maxWidth={360}>
            Change the pace, swap a stop, or add the whole plan at once — every line stays
            individually cancellable.
          </SectionAside>
        }
      />

      <div
        data-grid="split"
        style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 22, alignItems: 'start' }}
      >
        {/* Itinerary */}
        <div
          style={{
            background: '#fff',
            border: `1px solid ${c.line}`,
            borderRadius: 22,
            boxShadow: '0 16px 40px -28px rgba(39,42,70,.3)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '18px 22px',
              borderBottom: `1px solid ${c.lineSoft}`,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600, color: c.ink }}>
              {plannerTotals.nightTotal} nights · {plannerDays.length} stops · Sri Lanka loop
            </span>
            <span
              style={{
                padding: '3px 9px',
                borderRadius: 5,
                background: c.primaryTint,
                color: c.primaryHover,
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              AI draft
            </span>

            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                padding: 3,
                borderRadius: 999,
                background: c.muted,
                gap: 2,
              }}
            >
              {PACES.map((p) => {
                const active = app.pace === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => app.setPace(p.id)}
                    style={{
                      padding: '6px 13px',
                      border: 'none',
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: active ? '#fff' : 'transparent',
                      color: active ? c.ink : c.textMuted,
                    }}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {plannerDays.map((day, i) => {
              const w = weatherStyle(day.weather)
              // Day number = nights consumed by every earlier stop, plus one.
              const dayNumber = plannerDays.slice(0, i).reduce((n, d) => n + d.nights, 0) + 1

              return (
                <div
                  key={`${day.place}-${day.originalIndex}`}
                  data-itin-day
                  style={{
                    display: 'flex',
                    gap: 18,
                    padding: '18px 22px',
                    borderBottom: `1px solid ${c.lineFaint}`,
                  }}
                >
                  <div
                    data-itin-gutter
                    style={{
                      flex: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      width: 52,
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: 11,
                        background: c.primaryTint,
                        color: c.primary,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      D{dayNumber}
                    </span>
                    <span style={{ fontSize: 11.5, color: c.textFaint, textAlign: 'center' }}>
                      {day.drive}
                    </span>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 600, color: c.ink }}>
                        {day.place}
                      </span>
                      <span style={{ fontSize: 13, color: c.textSubtle }}>
                        {plural(day.nights, 'night')}
                      </span>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: 5,
                          background: w.bg,
                          color: w.color,
                          fontSize: 11.5,
                          fontWeight: 500,
                        }}
                      >
                        {day.weather}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {day.items.map((item) => {
                        const value = parsePrice(item.price)
                        const isStay = item.tag === 'STAY'
                        return (
                          <div
                            key={item.text}
                            data-itin-row
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '9px 12px',
                              border: `1px solid ${c.line}`,
                              borderRadius: 10,
                              background: c.page,
                            }}
                          >
                            <span
                              style={{
                                flex: 'none',
                                width: 20,
                                fontSize: 11,
                                fontWeight: 600,
                                color: c.cyan,
                              }}
                            >
                              {item.tag}
                            </span>
                            <span
                              data-itin-text
                              style={{ flex: 1, minWidth: 0, fontSize: 14.5, color: c.body }}
                            >
                              {item.text}
                            </span>
                            <span
                              data-itin-price
                              style={{
                                flex: 'none',
                                fontSize: 13,
                                fontWeight: 500,
                                color: c.ink,
                              }}
                            >
                              {item.price}
                            </span>
                            <button
                              type="button"
                              data-hover="outline"
                              onClick={() =>
                                app.addToCart({
                                  id: `it-${day.place}${item.text.slice(0, 6)}`,
                                  kind: isStay ? 'Stay' : 'Activity',
                                  name: item.text,
                                  meta: `${day.place} · ${
                                    isStay
                                      ? plural(day.nights, 'night')
                                      : plural(app.travellers, 'traveller')
                                  }`,
                                  price: isStay ? value * day.nights : value * app.travellers,
                                  free: true,
                                })
                              }
                              style={{
                                flex: 'none',
                                padding: '5px 10px',
                                border: `1px solid ${c.lineStrong}`,
                                borderRadius: 7,
                                background: '#fff',
                                color: c.body,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer',
                              }}
                            >
                              Add
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                      <button
                        type="button"
                        onClick={() => app.swapDay(day.originalIndex)}
                        data-hover="outline"
                        style={dayActionStyle}
                      >
                        Swap this day
                      </button>
                      <button
                        type="button"
                        onClick={() => app.removeDay(day.originalIndex)}
                        data-hover="outline"
                        style={dayActionStyle}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 22px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={app.optimise}
              data-hover="ink"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 42,
                padding: '0 18px',
                border: 'none',
                borderRadius: 8,
                background: c.ink,
                color: '#fff',
                fontSize: 14.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Icon name="AutoMode" size={17} />
              Re-optimise route
            </button>
            <button
              type="button"
              onClick={app.addDay}
              data-hover="outline"
              style={{
                height: 42,
                padding: '0 18px',
                border: `1px solid ${c.lineStrong}`,
                borderRadius: 8,
                background: '#fff',
                color: c.body,
                fontSize: 14.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Add a day
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: c.textSubtle }}>
              {app.optimised
                ? 'Route re-ordered to cut 2h 10m of driving'
                : 'AI keeps every drive under 4 hours'}
            </span>
          </div>
        </div>

        {/* Trip total + AI checks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: c.navy, borderRadius: 22, padding: 24, color: '#fff' }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: c.yellow,
                marginBottom: 14,
              }}
            >
              Trip total
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: -1 }}>
                {money(plannerTotals.total)}
              </span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
                · {money(Math.round(plannerTotals.total / app.travellers))} per person
              </span>
            </div>
            <div
              style={{ fontSize: 13.5, color: 'rgba(255,255,255,.62)', marginBottom: 18 }}
            >
              {plannerTotals.nightTotal} nights, {app.travellers} travellers,{' '}
              {plannerDays.length} stops, all ground transport
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
                paddingTop: 16,
                borderTop: '1px solid rgba(255,255,255,.14)',
              }}
            >
              {[
                {
                  label: `Stays (${plannerTotals.nightTotal} nights)`,
                  value: money(plannerTotals.stayCost),
                },
                {
                  label: `Activities × ${app.travellers}`,
                  value: money(plannerTotals.activityCost * app.travellers),
                },
                { label: 'Private driver & transfers', value: money(plannerTotals.transport) },
                { label: 'Taxes & service', value: money(plannerTotals.fees) },
              ].map((line) => (
                <div
                  key={line.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,.7)' }}>{line.label}</span>
                  <span style={{ fontWeight: 500 }}>{line.value}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={app.addPlanToCart}
              data-hover="primary"
              style={{
                width: '100%',
                marginTop: 20,
                height: 46,
                border: 'none',
                borderRadius: 8,
                background: c.primary,
                color: '#fff',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Add whole plan to cart
            </button>
            <button
              type="button"
              onClick={app.activateCompanion}
              data-hover="light"
              style={{
                width: '100%',
                marginTop: 10,
                height: 42,
                border: '1px solid rgba(255,255,255,.4)',
                borderRadius: 8,
                background: 'transparent',
                color: '#fff',
                fontSize: 14.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {app.companionOn ? 'Live companion is on' : 'Turn on live companion'}
            </button>
            <p
              style={{
                marginTop: 12,
                fontSize: 12,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,.45)',
              }}
            >
              Adds {plannerDays.length} stops as separate cancellable lines. Nothing is charged
              until checkout.
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              border: `1px solid ${c.line}`,
              borderRadius: 22,
              padding: 22,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: c.ink, marginBottom: 14 }}>
              AI checks on this trip
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PLANNER_CHECKS.map((check) => (
                <div key={check.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      flex: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      background: check.bg,
                      color: check.color,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {check.mark}
                  </span>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 500, color: c.ink }}>
                      {check.title}
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5, color: c.textMuted }}>
                      {check.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

const dayActionStyle = {
  padding: '6px 12px',
  borderRadius: 999,
  border: `1px dashed ${c.lineDashed}`,
  background: '#fff',
  color: c.body,
  fontSize: 12.5,
  cursor: 'pointer',
} as const
