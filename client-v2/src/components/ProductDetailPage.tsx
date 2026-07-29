import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AvailabilityCalendar } from '@/components/ui/AvailabilityCalendar'
import { CardTitleRow } from '@/components/ui/CatalogueCard'
import { Icon } from '@/components/ui/Icon'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { ACTIVITIES, PACKAGES, STAYS, TRANSPORT } from '@/data/catalogue'
import { c } from '@/lib/theme'
import type { CartDraft } from '@/lib/types'
import { useApp } from '@/state/store'

interface Listing {
  badgeLabel: string
  badgeBg?: string
  badgeColor?: string
  slotId: string
  placeholder: string
  aiNote: string
  price: number
  unitLabel: string
  content: ReactNode
  draft: CartDraft
}

/** Looks up the item behind a /listing/:category/:id route and shapes it for this page. */
function useListing(category: string | undefined, id: string | undefined, travellers: number): Listing | null {
  if (category === 'stays') {
    const stay = STAYS.find((s) => s.id === id)
    if (!stay) return null
    return {
      badgeLabel: stay.badge,
      slotId: stay.slotId,
      placeholder: stay.placeholder,
      aiNote: stay.aiNote,
      price: stay.price,
      unitLabel: '/ night',
      content: (
        <CardTitleRow rating={stay.rating} reviews={stay.reviews} name={stay.name} subtitle={stay.place} />
      ),
      draft: {
        id: stay.id,
        kind: 'Stay',
        name: stay.name,
        meta: `${stay.place} · 1 night`,
        price: stay.price,
        free: true,
      },
    }
  }

  if (category === 'activities') {
    const activity = ACTIVITIES.find((a) => a.id === id)
    if (!activity) return null
    return {
      badgeLabel: activity.category,
      badgeBg: activity.chipBg,
      badgeColor: activity.chipColor,
      slotId: activity.slotId,
      placeholder: activity.placeholder,
      aiNote: activity.aiNote,
      price: activity.price,
      unitLabel: '/ person',
      content: <CardTitleRow rating={activity.rating} name={activity.name} subtitle={activity.detail} />,
      draft: {
        id: activity.id,
        kind: 'Activity',
        name: activity.name,
        meta: `${activity.detail} · ${travellers} traveller${travellers === 1 ? '' : 's'}`,
        price: activity.price * travellers,
        free: true,
      },
    }
  }

  if (category === 'packages') {
    const pkg = PACKAGES.find((p) => p.id === id)
    if (!pkg) return null
    return {
      badgeLabel: pkg.tag,
      slotId: pkg.slotId,
      placeholder: pkg.placeholder,
      aiNote: pkg.aiNote,
      price: pkg.price,
      unitLabel: '/ person',
      content: (
        <>
          <div style={{ fontSize: 13.5, color: c.textSubtle }}>{pkg.duration}</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>{pkg.name}</div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: c.body }}>{pkg.blurb}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pkg.includes.map((line) => (
              <div
                key={line}
                style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 13, color: c.body }}
              >
                <span style={{ flex: 'none', color: c.primary, fontWeight: 700 }}>✓</span>
                {line}
              </div>
            ))}
          </div>
        </>
      ),
      draft: {
        id: pkg.id,
        kind: 'Package',
        name: pkg.name,
        meta: `${pkg.duration} · ${travellers} traveller${travellers === 1 ? '' : 's'}`,
        price: pkg.price * travellers,
        free: false,
      },
    }
  }

  if (category === 'transport') {
    const transport = TRANSPORT.find((t) => t.id === id)
    if (!transport) return null
    return {
      badgeLabel: transport.mode,
      slotId: transport.slotId,
      placeholder: transport.placeholder,
      aiNote: transport.aiNote,
      price: transport.price,
      unitLabel: transport.unit,
      content: (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: c.yellow }}>★</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: c.ink }}>{transport.rating}</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>{transport.name}</div>
          <div style={{ fontSize: 13.5, color: c.textSubtle }}>{transport.route}</div>
          <div style={{ fontSize: 13, color: c.textSubtle }}>{transport.detail}</div>
        </>
      ),
      draft: {
        id: transport.id,
        kind: 'Transfer',
        name: transport.name,
        meta: `${transport.route} · ${transport.mode}`,
        price: transport.price,
        free: true,
      },
    }
  }

  return null
}

/**
 * Standalone route (`/listing/:category/:id`) — its own URL, bookmarkable and
 * back/forward-friendly, opened from any catalogue card's View button. Photo
 * and details sit on the left; a booking-availability calendar on the right.
 */
export function ProductDetailPage() {
  const { category, id } = useParams<{ category: string; id: string }>()
  const navigate = useNavigate()
  const { money, addToCart, travellers } = useApp()
  const [date, setDate] = useState<Date | undefined>(undefined)

  const listing = useListing(category, id, travellers)

  if (!listing) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(20px, 3vw, 40px)' }}>
        <p style={{ fontSize: 15, color: c.body, marginBottom: 12 }}>We couldn&apos;t find that listing.</p>
        <Link to="/" style={{ color: c.primary, fontWeight: 500 }}>
          Back to browsing
        </Link>
      </div>
    )
  }

  const {
    slotId,
    placeholder,
    badgeLabel,
    badgeBg = 'rgba(255,255,255,.94)',
    badgeColor = c.ink,
    aiNote,
    price,
    unitLabel,
    content,
    draft,
  } = listing

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(20px, 3vw, 40px)' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        data-hover="text"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          border: 'none',
          background: 'transparent',
          color: c.textSubtle,
          fontSize: 13.5,
          cursor: 'pointer',
          marginBottom: 20,
          padding: 0,
        }}
      >
        <Icon name="ChevronLeft" size={16} />
        Back
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 1fr)',
          gap: 32,
          alignItems: 'start',
        }}
      >
        {/* Left: photo + details */}
        <div
          style={{
            border: `1px solid ${c.line}`,
            borderRadius: 20,
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 14px 34px -24px rgba(39,42,70,.24)',
          }}
        >
          <div style={{ position: 'relative', height: 340, background: c.photoBg }}>
            <ImageSlot id={slotId} placeholder={placeholder} />
            <span
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
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

          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {content}

            <div
              style={{
                display: 'flex',
                gap: 7,
                alignItems: 'flex-start',
                padding: 10,
                borderRadius: 10,
                background: '#f2f8fb',
                marginTop: 4,
              }}
            >
              <span style={{ flex: 'none', color: c.cyan, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
                AI
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: c.body }}>{aiNote}</span>
            </div>
          </div>
        </div>

        {/* Right: availability + booking */}
        <div
          style={{
            position: 'sticky',
            top: 'calc(var(--header-h) + 20px)',
            border: `1px solid ${c.line}`,
            borderRadius: 20,
            background: '#fff',
            boxShadow: '0 14px 34px -24px rgba(39,42,70,.24)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="Calendar" size={18} color={c.textSubtle} />
            <span style={{ fontSize: 14.5, fontWeight: 600, color: c.ink }}>Check availability</span>
          </div>

          <AvailabilityCalendar slotId={slotId} selected={date} onSelect={setDate} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              paddingTop: 14,
              borderTop: `1px solid ${c.lineSoft}`,
            }}
          >
            <span style={{ fontSize: 19, fontWeight: 600, color: c.ink }}>
              {money(price)}
              <span style={{ fontSize: 13, fontWeight: 400, color: c.textSubtle }}> {unitLabel}</span>
            </span>
          </div>

          <button
            type="button"
            data-hover="ink"
            onClick={() => addToCart(draft)}
            style={{
              height: 44,
              border: 'none',
              borderRadius: 10,
              background: c.ink,
              color: '#fff',
              fontSize: 14.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}
