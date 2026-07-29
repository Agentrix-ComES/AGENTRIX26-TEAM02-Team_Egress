import { useState } from 'react'

import { ImageSlot } from '@/components/ui/ImageSlot'
import { ScrollRow } from '@/components/ui/ScrollRow'
import { Section, SectionHead } from '@/components/ui/Section'
import { TRANSPORT, TRANSPORT_FILTERS } from '@/data/catalogue'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Transport() {
  const { addToCart, money } = useApp()
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
          <div
            key={transport.id}
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
              <ImageSlot id={transport.slotId} placeholder={transport.placeholder} />
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
                {transport.mode}
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
                  {transport.rating}
                </span>
              </div>

              <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>
                {transport.name}
              </div>
              <div style={{ fontSize: 13.5, color: c.textSubtle }}>{transport.route}</div>
              <div style={{ fontSize: 13, color: c.textSubtle }}>{transport.detail}</div>

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
                  {transport.aiNote}
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
                  {money(transport.price)}
                  <span style={{ fontSize: 13, fontWeight: 400, color: c.textSubtle }}>
                    {' '}
                    {transport.unit}
                  </span>
                </span>
                <button
                  type="button"
                  data-hover="ink"
                  onClick={() =>
                    addToCart({
                      id: transport.id,
                      kind: 'Transfer',
                      name: transport.name,
                      meta: `${transport.route} · ${transport.mode}`,
                      price: transport.price,
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
