import { CardTitleRow, CatalogueCard } from '@/components/ui/CatalogueCard'
import { ScrollRow } from '@/components/ui/ScrollRow'
import { Section, SectionHead } from '@/components/ui/Section'
import { ACTIVITIES, ACTIVITY_FILTERS } from '@/data/catalogue'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Activities() {
  const { activityFilter, setActivityFilter, addToCart, travellers } = useApp()

  const visible =
    activityFilter === 'All'
      ? ACTIVITIES
      : ACTIVITIES.filter((a) => a.category === activityFilter)

  return (
    <Section id="activities" wide>
      <SectionHead
        eyebrow="Activities"
        title="Things worth getting up early for."
        marginBottom={26}
        aside={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ACTIVITY_FILTERS.map((filter) => {
              const active = activityFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActivityFilter(filter)}
                  aria-pressed={active}
                  style={{
                    padding: '8px 15px',
                    borderRadius: 999,
                    border: `1px solid ${active ? c.primary : c.lineStrong}`,
                    background: active ? c.primaryTint : '#fff',
                    color: active ? c.primaryHover : c.body,
                    fontSize: 13.5,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {filter}
                </button>
              )
            })}
          </div>
        }
      />

      <ScrollRow itemWidth={300} gap={20}>
        {visible.map((activity) => (
          <CatalogueCard
            key={activity.id}
            id={activity.id}
            category="activities"
            slotId={activity.slotId}
            placeholder={activity.placeholder}
            badgeLabel={activity.category}
            badgeBg={activity.chipBg}
            badgeColor={activity.chipColor}
            aiNote={activity.aiNote}
            price={activity.price}
            unitLabel="/ person"
            onAdd={() =>
              addToCart({
                id: activity.id,
                kind: 'Activity',
                name: activity.name,
                meta: `${activity.detail} · ${travellers} traveller${travellers === 1 ? '' : 's'}`,
                price: activity.price * travellers,
                free: true,
              })
            }
          >
            <CardTitleRow rating={activity.rating} name={activity.name} subtitle={activity.detail} />
          </CatalogueCard>
        ))}
      </ScrollRow>
    </Section>
  )
}
