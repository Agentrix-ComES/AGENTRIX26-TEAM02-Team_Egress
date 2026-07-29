import type { CSSProperties } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'

import { isAvailable } from '@/lib/availability'
import { c } from '@/lib/theme'

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

interface AvailabilityCalendarProps {
  slotId: string
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}

/**
 * Month-at-a-glance availability picker used on the product detail page.
 * Availability is simulated (deterministic per slot + date) since there is no
 * live inventory feed in this prototype.
 */
export function AvailabilityCalendar({ slotId, selected, onSelect }: AvailabilityCalendarProps) {
  const today = startOfToday()
  const selectedAvailable = selected ? isAvailable(slotId, selected) : null

  return (
    <div>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        defaultMonth={selected ?? today}
        startMonth={today}
        disabled={(date) => date < today || !isAvailable(slotId, date)}
        modifiers={{ unavailable: (date) => date >= today && !isAvailable(slotId, date) }}
        modifiersClassNames={{ unavailable: 'rdp-day_unavailable' }}
        style={
          {
            margin: 0,
            '--rdp-accent-color': c.ink,
            '--rdp-accent-background-color': c.primaryTint,
            '--rdp-day-width': '38px',
            '--rdp-day-height': '38px',
            '--rdp-day_button-width': '36px',
            '--rdp-day_button-height': '36px',
          } as CSSProperties
        }
      />

      <style>{`.rdp-day_unavailable:not(.rdp-selected) button, .rdp-day_unavailable button { text-decoration: line-through; }`}</style>

      <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: 12, color: c.textSubtle }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#fff', border: `1px solid ${c.lineStrong}` }} />
          Available
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: c.muted }} />
          Fully booked
        </span>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: '10px 12px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          background: selected ? (selectedAvailable ? c.greenTint : c.primaryTint) : c.muted,
          color: selected ? (selectedAvailable ? c.greenInk : c.primaryHover) : c.textSubtle,
        }}
      >
        {selected
          ? selectedAvailable
            ? `Available on ${selected.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} — add to cart to hold this date.`
            : `Fully booked on ${selected.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} — pick another date.`
          : 'Pick a date to check availability.'}
      </div>
    </div>
  )
}
