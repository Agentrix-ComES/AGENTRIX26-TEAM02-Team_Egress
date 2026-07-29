import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ImageSlot } from '@/components/ui/ImageSlot'
import { c } from '@/lib/theme'
import type { TraditionalCategory } from '@/lib/types'
import { useApp } from '@/state/store'

interface CatalogueCardProps {
  id: string
  /** Which catalogue section this belongs to — used to build the /listing/:category/:id link. */
  category: TraditionalCategory
  slotId: string
  placeholder: string
  badgeLabel: string
  badgeBg?: string
  badgeColor?: string
  aiNote: string
  price: number
  /** e.g. "/ night", "/ person" — appended after the price, as-is. */
  unitLabel: string
  onAdd: () => void
  /** The kind-specific middle content (rating, detail line, includes list, …). */
  children: ReactNode
}

/**
 * The card shell used across every catalogue listing — Stays, Activities,
 * Packages, and the AI search results all render through this so a result
 * looks exactly like the same item does when browsed directly.
 */
export function CatalogueCard({
  id,
  category,
  slotId,
  placeholder,
  badgeLabel,
  badgeBg = 'rgba(255,255,255,.94)',
  badgeColor = c.ink,
  aiNote,
  price,
  unitLabel,
  onAdd,
  children,
}: CatalogueCardProps) {
  const { money } = useApp()

  return (
    <div
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
        <ImageSlot id={slotId} placeholder={placeholder} />
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '5px 11px',
            borderRadius: 999,
            background: badgeBg,
            color: badgeColor,
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          {badgeLabel}
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
        {children}

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
          <span style={{ fontSize: 13, lineHeight: 1.5, color: c.body }}>{aiNote}</span>
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
            {money(price)}
            <span style={{ fontSize: 13, fontWeight: 400, color: c.textSubtle }}> {unitLabel}</span>
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              to={`/listing/${category}/${id}`}
              data-hover="outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 36,
                padding: '0 14px',
                border: `1px solid ${c.lineStrong}`,
                borderRadius: 8,
                background: '#fff',
                color: c.ink,
                fontSize: 13.5,
                fontWeight: 500,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              View
            </Link>
            <button
              type="button"
              data-hover="ink"
              onClick={onAdd}
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
    </div>
  )
}

/** The name + rating row shared by Stays and Activities cards. */
export function CardTitleRow({
  rating,
  reviews,
  name,
  subtitle,
}: {
  rating?: string
  reviews?: string
  name: string
  subtitle: string
}) {
  return (
    <>
      {rating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: c.yellow }}>★</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: c.ink }}>{rating}</span>
          {reviews && <span style={{ fontSize: 13, color: c.textSubtle }}>{reviews}</span>}
        </div>
      )}
      <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>{name}</div>
      <div style={{ fontSize: 13.5, color: c.textSubtle }}>{subtitle}</div>
    </>
  )
}
