import { CatalogueCard } from '@/components/ui/CatalogueCard'
import { ScrollRow } from '@/components/ui/ScrollRow'
import { Section, SectionAside, SectionHead } from '@/components/ui/Section'
import { PACKAGES } from '@/data/catalogue'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Packages() {
  const { addToCart, travellers } = useApp()

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
          <CatalogueCard
            key={pkg.id}
            id={pkg.id}
            category="packages"
            slotId={pkg.slotId}
            placeholder={pkg.placeholder}
            badgeLabel={pkg.tag}
            aiNote={pkg.aiNote}
            price={pkg.price}
            unitLabel="/ person"
            onAdd={() =>
              addToCart({
                id: pkg.id,
                kind: 'Package',
                name: pkg.name,
                meta: `${pkg.duration} · ${travellers} traveller${travellers === 1 ? '' : 's'}`,
                price: pkg.price * travellers,
                free: false,
              })
            }
          >
            <div style={{ fontSize: 13.5, color: c.textSubtle }}>{pkg.duration}</div>

            <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>
              {pkg.name}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: c.body }}>{pkg.blurb}</p>

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
          </CatalogueCard>
        ))}
      </ScrollRow>
    </Section>
  )
}
