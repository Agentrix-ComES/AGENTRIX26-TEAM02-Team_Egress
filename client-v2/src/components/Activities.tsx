import { ImageSlot } from '@/components/ui/ImageSlot'
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
    <Section id="activities">
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

      <div
        className="cs-scroll"
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 270,
          gap: 18,
          overflowX: 'auto',
          paddingBottom: 12,
        }}
      >
        {visible.map((activity) => (
          <div
            key={activity.id}
            style={{
              position: 'relative',
              height: 360,
              borderRadius: 22,
              overflow: 'hidden',
              background: '#e7eef2',
            }}
          >
            <ImageSlot id={activity.slotId} placeholder={activity.placeholder} />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'linear-gradient(180deg,rgba(13,13,17,0) 38%,rgba(13,13,17,.85) 100%)',
              }}
            />

            <span
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
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

            <div
              style={{
                position: 'absolute',
                left: 18,
                right: 18,
                bottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}
            >
              <span style={{ fontSize: 19, fontWeight: 600, color: '#fff', lineHeight: 1.25 }}>
                {activity.name}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.78)' }}>
                {activity.detail}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                  from {money(activity.price)}
                </span>
                <button
                  type="button"
                  data-hover="yellow"
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
                    height: 32,
                    padding: '0 14px',
                    border: 'none',
                    borderRadius: 8,
                    background: '#fff',
                    color: c.ink,
                    fontSize: 13,
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
