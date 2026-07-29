import { CardTitleRow, CatalogueCard } from '@/components/ui/CatalogueCard'
import { ScrollRow } from '@/components/ui/ScrollRow'
import { Section, SectionAside, SectionHead } from '@/components/ui/Section'
import { STAYS } from '@/data/catalogue'
import { useApp } from '@/state/store'

export function Stays() {
  const { addToCart } = useApp()

  return (
    <Section id="stays" background="#fff" wide>
      <SectionHead
        eyebrow="Stays"
        title="Hotels, villas and boutique lodges."
        aside={<SectionAside maxWidth={330}>Book any of these on their own — no AI plan required.</SectionAside>}
      />

      <ScrollRow itemWidth={300} gap={20}>
        {STAYS.map((stay) => (
          <CatalogueCard
            key={stay.id}
            id={stay.id}
            category="stays"
            slotId={stay.slotId}
            placeholder={stay.placeholder}
            badgeLabel={stay.badge}
            aiNote={stay.aiNote}
            price={stay.price}
            unitLabel="/ night"
            onAdd={() =>
              addToCart({
                id: stay.id,
                kind: 'Stay',
                name: stay.name,
                meta: `${stay.place} · 1 night`,
                price: stay.price,
                free: true,
              })
            }
          >
            <CardTitleRow rating={stay.rating} reviews={stay.reviews} name={stay.name} subtitle={stay.place} />
          </CatalogueCard>
        ))}
      </ScrollRow>
    </Section>
  )
}
