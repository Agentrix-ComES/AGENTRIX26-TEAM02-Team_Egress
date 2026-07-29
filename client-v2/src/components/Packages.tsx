import { ImageSlot } from '@/components/ui/ImageSlot'
import { ScrollRow } from '@/components/ui/ScrollRow'
import { Section, SectionAside, SectionHead } from '@/components/ui/Section'
import { PACKAGES } from '@/data/catalogue'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Packages() {
  const { addToCart, travellers, money } = useApp()

  return (
    <Section id="packages" background="#fff" wide>
      <SectionHead
        eyebrow="Holiday packages"
        title="Whole trips, one price."
        marginBottom={32}
        aside={
          <SectionAside maxWidth={340}>
            Add one to the cart as-is, or open it in the AI planner and change anything.
          </SectionAside>
        }
      />

      <ScrollRow itemWidth={300} gap={20}>
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
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
              <ImageSlot id={pkg.slotId} placeholder={pkg.placeholder} />
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
                {pkg.tag}
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
              <div style={{ fontSize: 13.5, color: c.textSubtle }}>{pkg.duration}</div>

              <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>
                {pkg.name}
              </div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: c.body }}>
                {pkg.blurb}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pkg.includes.map((line) => (
                  <div
                    key={line}
                    style={{
                      display: 'flex',
                      gap: 7,
                      alignItems: 'flex-start',
                      fontSize: 13,
                      color: c.body,
                    }}
                  >
                    <span style={{ flex: 'none', color: c.primary, fontWeight: 700 }}>✓</span>
                    {line}
                  </div>
                ))}
              </div>

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
                <span style={{ fontSize: 13, lineHeight: 1.5, color: c.body }}>{pkg.aiNote}</span>
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
                  {money(pkg.price)}
                  <span style={{ fontSize: 13, fontWeight: 400, color: c.textSubtle }}>
                    {' '}
                    / person
                  </span>
                </span>
                <button
                  type="button"
                  data-hover="ink"
                  onClick={() =>
                    addToCart({
                      id: pkg.id,
                      kind: 'Package',
                      name: pkg.name,
                      meta: `${pkg.duration} · ${travellers} traveller${travellers === 1 ? '' : 's'}`,
                      price: pkg.price * travellers,
                      free: false,
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
      </ScrollRow>
    </Section>
  )
}
