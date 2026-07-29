import { ImageSlot } from '@/components/ui/ImageSlot'
import { Section, SectionAside, SectionHead } from '@/components/ui/Section'
import { STAYS } from '@/data/catalogue'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Stays() {
  const { addToCart, money } = useApp()

  return (
    <Section id="stays" background="#fff">
      <SectionHead
        eyebrow="Stays"
        title="Hotels, villas and boutique lodges."
        aside={<SectionAside maxWidth={330}>Book any of these on their own — no AI plan required.</SectionAside>}
      />

      <div
        data-grid="four-up"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}
      >
        {STAYS.map((stay) => (
          <div
            key={stay.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: `1px solid ${c.line}`,
              borderRadius: 20,
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '0 14px 34px -24px rgba(39,42,70,.24)',
            }}
          >
            <div style={{ position: 'relative', height: 196, background: c.photoBg }}>
              <ImageSlot id={stay.slotId} placeholder={stay.placeholder} />
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  padding: '5px 11px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,.94)',
                  color: c.ink,
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                {stay.badge}
              </span>
            </div>

            <div
              style={{
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: c.yellow }}>★</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: c.ink }}>
                  {stay.rating}
                </span>
                <span style={{ fontSize: 13, color: c.textSubtle }}>{stay.reviews}</span>
              </div>

              <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>
                {stay.name}
              </div>
              <div style={{ fontSize: 13.5, color: c.textSubtle }}>{stay.place}</div>

              <div
                style={{
                  display: 'flex',
                  gap: 7,
                  alignItems: 'flex-start',
                  padding: 10,
                  borderRadius: 10,
                  background: '#f2f8fb',
                }}
              >
                <span
                  style={{
                    flex: 'none',
                    color: c.cyan,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                  }}
                >
                  AI
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: c.body }}>{stay.aiNote}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginTop: 'auto',
                  paddingTop: 10,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 600, color: c.ink }}>
                  {money(stay.price)}
                  <span style={{ fontSize: 13, fontWeight: 400, color: c.textSubtle }}>
                    {' '}
                    / night
                  </span>
                </span>
                <button
                  type="button"
                  data-hover="ink"
                  onClick={() =>
                    addToCart({
                      id: stay.id,
                      kind: 'Stay',
                      name: stay.name,
                      meta: `${stay.place} · 1 night`,
                      price: stay.price,
                      free: true,
                    })
                  }
                  style={{
                    height: 36,
                    padding: '0 14px',
                    border: 'none',
                    borderRadius: 8,
                    background: c.ink,
                    color: '#fff',
                    fontSize: 13.5,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
