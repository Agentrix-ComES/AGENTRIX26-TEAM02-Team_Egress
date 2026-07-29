import { ImageSlot } from '@/components/ui/ImageSlot'
import { Section, SectionAside, SectionHead } from '@/components/ui/Section'
import { PACKAGES } from '@/data/catalogue'
import { accentTheme, c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Packages() {
  const { addToCart, travellers, money } = useApp()

  return (
    <Section id="packages" background="#fff">
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

      <div
        data-grid="three-up"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}
      >
        {PACKAGES.map((pkg) => {
          const t = accentTheme(pkg.accent)
          return (
            <div
              key={pkg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 22,
                overflow: 'hidden',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                boxShadow: t.cardShadow,
              }}
            >
              <div style={{ height: 212, background: c.photoBg }}>
                <ImageSlot id={pkg.slotId} placeholder={pkg.placeholder} />
              </div>

              <div
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  flex: 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '4px 11px',
                      borderRadius: 999,
                      background: t.tagBg,
                      color: t.tagColor,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {pkg.tag}
                  </span>
                  <span style={{ fontSize: 13, color: t.subColor }}>{pkg.duration}</span>
                </div>

                <h3
                  style={{
                    fontSize: 23,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: t.titleColor,
                  }}
                >
                  {pkg.name}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: t.bodyColor }}>{pkg.blurb}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
                  {pkg.includes.map((line) => (
                    <div
                      key={line}
                      style={{
                        display: 'flex',
                        gap: 9,
                        alignItems: 'flex-start',
                        fontSize: 14,
                        color: t.bodyColor,
                      }}
                    >
                      <span style={{ flex: 'none', color: t.checkColor, fontWeight: 700 }}>✓</span>
                      {line}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginTop: 'auto',
                    paddingTop: 14,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: t.titleColor }}>
                      from {money(pkg.price)}
                    </div>
                    <div style={{ fontSize: 12.5, color: t.subColor }}>per person, twin share</div>
                  </div>
                  <button
                    type="button"
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
                      height: 38,
                      padding: '0 18px',
                      border: 'none',
                      borderRadius: 8,
                      background: t.btnBg,
                      color: t.btnColor,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
