import { ImageSlot } from '@/components/ui/ImageSlot'
import { ScrollRow } from '@/components/ui/ScrollRow'
import { Section, SectionHead } from '@/components/ui/Section'
import { ACTIVITIES, ACTIVITY_FILTERS } from '@/data/catalogue'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Activities() {
  const { activityFilter, setActivityFilter, addToCart, travellers, money } = useApp()

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
          <div
            key={activity.id}
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
              <ImageSlot id={activity.slotId} placeholder={activity.placeholder} />
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  padding: '5px 11px',
                  borderRadius: 999,
                  background: activity.chipBg,
                  color: activity.chipColor,
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                {activity.category}
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
                  {activity.rating}
                </span>
              </div>

              <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>
                {activity.name}
              </div>
              <div style={{ fontSize: 13.5, color: c.textSubtle }}>{activity.detail}</div>

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
                <span style={{ fontSize: 13, lineHeight: 1.5, color: c.body }}>
                  {activity.aiNote}
                </span>
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
                  {money(activity.price)}
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
                      id: activity.id,
                      kind: 'Activity',
                      name: activity.name,
                      meta: `${activity.detail} · ${travellers} traveller${travellers === 1 ? '' : 's'}`,
                      price: activity.price * travellers,
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
      </ScrollRow>
    </Section>
  )
}
