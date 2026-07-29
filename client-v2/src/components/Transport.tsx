import { useState } from 'react'

import { CatalogueCard } from '@/components/ui/CatalogueCard'
import { ScrollRow } from '@/components/ui/ScrollRow'
import { Section, SectionHead } from '@/components/ui/Section'
import { TRANSPORT, TRANSPORT_FILTERS } from '@/data/catalogue'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Transport() {
  const { addToCart } = useApp()
  const [filter, setFilter] = useState<(typeof TRANSPORT_FILTERS)[number]>('All')

  const visible =
    filter === 'All' ? TRANSPORT : TRANSPORT.filter((t) => t.mode === filter)

  return (
    <Section id="transport" background="#fff" wide>
      <SectionHead
        eyebrow="Transport"
        title="Getting between the good bits."
        marginBottom={26}
        aside={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TRANSPORT_FILTERS.map((option) => {
              const active = filter === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
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
                  {option}
                </button>
              )
            })}
          </div>
        }
      />

      <ScrollRow itemWidth={300} gap={20}>
        {visible.map((transport) => (
          <CatalogueCard
            key={transport.id}
            id={transport.id}
            category="transport"
            slotId={transport.slotId}
            placeholder={transport.placeholder}
            badgeLabel={transport.mode}
            aiNote={transport.aiNote}
            price={transport.price}
            unitLabel={transport.unit}
            onAdd={() =>
              addToCart({
                id: transport.id,
                kind: 'Transfer',
                name: transport.name,
                meta: `${transport.route} · ${transport.mode}`,
                price: transport.price,
                free: true,
              })
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: c.yellow }}>★</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: c.ink }}>
                {transport.rating}
              </span>
            </div>

            <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>
              {transport.name}
            </div>
            <div style={{ fontSize: 13.5, color: c.textSubtle }}>{transport.route}</div>
            <div style={{ fontSize: 13, color: c.textSubtle }}>{transport.detail}</div>
          </CatalogueCard>
        ))}
      </ScrollRow>
    </Section>
  )
}
