import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CatalogueCard } from '@/components/ui/CatalogueCard'
import { Icon } from '@/components/ui/Icon'
import { FOLLOW_UPS, SEARCH_CHIPS } from '@/data/content'
import { config } from '@/lib/config'
import { c, kindOf } from '@/lib/theme'
import type { ItemKind, TraditionalCategory } from '@/lib/types'
import { useApp } from '@/state/store'

export function SearchPanel() {
  const app = useApp()
  // Mirrors Google's search: a plain bar first, with an "AI Mode" chip that
  // swaps in the conversational bar once the traveller opts in.
  const [aiMode, setAiMode] = useState(false)

  return (
    <section id="search" style={{ padding: '0 var(--page-pad) 32px' }}>
      <div
        style={{
          maxWidth: 1080,
          // Overlaps the hero by 56px on desktop; less on narrow screens, where
          // that much overlap would swallow the hero's badges.
          margin: 'clamp(-56px, -4vw, -14px) auto 0',
          position: 'relative',
          background: '#fff',
          border: `1px solid ${c.line}`,
          borderRadius: 26,
          boxShadow: '0 28px 70px -32px rgba(39,42,70,.28)',
          padding: 'clamp(14px, 2vw, 26px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 999, background: c.muted }}>
            <button
              type="button"
              onClick={() => setAiMode(false)}
              aria-pressed={!aiMode}
              data-hover="text"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 999,
                border: 'none',
                background: aiMode ? 'transparent' : '#fff',
                color: aiMode ? c.textSubtle : c.ink,
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: aiMode ? 'none' : '0 1px 4px rgba(39,42,70,.14)',
              }}
            >
              <Icon name="Search" size={15} />
              Search
            </button>
            <button
              type="button"
              onClick={() => setAiMode(true)}
              aria-pressed={aiMode}
              data-hover="text"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 999,
                border: 'none',
                background: aiMode ? '#fff' : 'transparent',
                color: aiMode ? c.primary : c.textSubtle,
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: aiMode ? '0 1px 4px rgba(39,42,70,.14)' : 'none',
              }}
            >
              <Icon name="AutoMode" size={15} />
              Ask AI
            </button>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: c.textSubtle }}>
            Live inventory · prices in {config.currency}
          </span>
        </div>

        {aiMode ? <AskBar /> : <TraditionalBar onEnterAiMode={() => setAiMode(true)} />}

        {app.status === 'thinking' && <Thinking />}
        {app.status === 'done' && <Results />}
        {app.status === 'empty' && <EmptyNote />}
      </div>
    </section>
  )
}

/** Shown when a search comes back with nothing — reused on the full AI search page. */
export function EmptyNote() {
  return (
    <p
      style={{
        marginTop: 24,
        paddingTop: 20,
        borderTop: `1px solid ${c.lineSoft}`,
        fontSize: 15,
        color: c.body,
      }}
    >
      Nothing matched that exactly. Loosen the budget or dates — or open the AI planner and
      we&apos;ll build a custom itinerary.
    </p>
  )
}

/** Maps an AI-search result's item kind to its /listing/:category route segment. */
const CATEGORY_OF_KIND: Record<ItemKind, TraditionalCategory> = {
  Stay: 'stays',
  Activity: 'activities',
  Package: 'packages',
  Transfer: 'transport',
}

/** The four catalogue sections travellers can jump the traditional search into. */
const SEARCH_CATEGORIES: { id: TraditionalCategory; label: string; placeholder: string }[] = [
  { id: 'stays', label: 'Stays', placeholder: 'Search stays — hotels, villas, boutique escapes…' },
  {
    id: 'activities',
    label: 'Activities',
    placeholder: 'Search activities — safaris, hikes, food walks…',
  },
  {
    id: 'packages',
    label: 'Packages',
    placeholder: 'Search packages — ready-made multi-day trips…',
  },
  {
    id: 'transport',
    label: 'Transport',
    placeholder: 'Search transport — drivers, trains, transfers…',
  },
]

/** `2026-08-12` → `12 Aug`. */
const formatShortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** Month-grid picker for a start/end date range — click once for check-in, again for check-out. */
function CalendarGrid({
  startDate,
  endDate,
  onPick,
}: {
  startDate: string
  endDate: string
  onPick: (iso: string) => void
}) {
  const todayIso = useMemo(() => toIso(new Date()), [])
  const [viewDate, setViewDate] = useState(() => {
    const base = startDate ? new Date(`${startDate}T00:00:00`) : new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (string | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toIso(new Date(year, month, i + 1))),
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          data-hover="text"
          style={{
            display: 'flex',
            width: 26,
            height: 26,
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: 8,
            background: 'transparent',
            color: c.body,
            cursor: 'pointer',
          }}
        >
          <Icon name="ChevronLeft" size={17} />
        </button>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: c.ink }}>
          {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Next month"
          data-hover="text"
          style={{
            display: 'flex',
            width: 26,
            height: 26,
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: 8,
            background: 'transparent',
            color: c.body,
            cursor: 'pointer',
          }}
        >
          <Icon name="ChevronRight" size={17} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: c.textFaint,
              padding: '4px 0',
            }}
          >
            {d}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {cells.map((iso, i) => {
          if (!iso) return <span key={`pad-${i}`} />
          const isPast = iso < todayIso
          const isStart = iso === startDate
          const isEnd = iso === endDate
          const inRange = !!startDate && !!endDate && iso > startDate && iso < endDate
          const selected = isStart || isEnd

          return (
            <button
              key={iso}
              type="button"
              disabled={isPast}
              onClick={() => onPick(iso)}
              style={{
                height: 32,
                border: 'none',
                borderRadius: isStart || isEnd ? 8 : inRange ? 0 : 8,
                background: selected ? c.primary : inRange ? c.primaryTint : 'transparent',
                color: isPast ? c.textFaint : selected ? '#fff' : c.ink,
                fontSize: 13,
                fontWeight: selected ? 600 : 500,
                cursor: isPast ? 'default' : 'pointer',
                opacity: isPast ? 0.45 : 1,
              }}
            >
              {Number(iso.slice(-2))}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Plain keyword search bar — what a traveller sees before opting into AI.
 * Shared between the homepage panel (which toggles AI Mode in place, via
 * `onEnterAiMode`) and the traditional search results page (which has no
 * local AI-mode toggle to flip, so it navigates straight to `/search` instead).
 */
export function TraditionalBar({ onEnterAiMode }: { onEnterAiMode?: () => void }) {
  const {
    query,
    setQuery,
    searchCategory: category,
    setSearchCategory: setCategory,
    searchStartDate: startDate,
    searchEndDate: endDate,
    setSearchDates,
    askSuggestion,
  } = useApp()
  const navigate = useNavigate()
  const activeCategory = SEARCH_CATEGORIES.find((cat) => cat.id === category)

  const enterAiMode =
    onEnterAiMode ??
    (() => {
      if (query.trim()) {
        askSuggestion(query)
        navigate(`/search?q=${encodeURIComponent(query)}`)
      } else {
        navigate('/search')
      }
    })

  const [datesOpen, setDatesOpen] = useState(false)

  // Navigates to the traditional search page — its own route, so the filters
  // are bookmarkable/shareable and survive a refresh (same pattern as AI Mode's /search).
  const submitTraditionalSearch = () => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('text', query.trim())
    if (category) params.set('category', category)
    if (startDate) params.set('start', startDate)
    if (endDate) params.set('end', endDate)
    navigate(`/search/traditional?${params.toString()}`)
  }

  const dateLabel = startDate
    ? endDate && endDate !== startDate
      ? `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`
      : formatShortDate(startDate)
    : null

  return (
    <div>
      {/* Tucked slightly behind the input bar's top edge — the bar's own
          border is drawn on top, so it stays intact instead of being erased. */}
      <div
        style={{
          display: 'flex',
          gap: 3,
          paddingLeft: 'clamp(14px, 1.8vw, 22px)',
          marginBottom: -8,
          overflowX: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {SEARCH_CATEGORIES.map((cat) => {
          const isActive = cat.id === category
          return (
            <button
              key={cat.id}
              type="button"
              // Only sets the search category — does not navigate the page.
              onClick={() => setCategory(isActive ? null : cat.id)}
              aria-pressed={isActive}
              data-hover={isActive ? undefined : 'text'}
              style={{
                flex: 'none',
                padding: '9px 16px',
                borderRadius: '10px 10px 0 0',
                border: `1px solid ${isActive ? c.primary : c.lineStrong}`,
                background: isActive ? c.primary : c.muted,
                color: isActive ? '#fff' : c.textSubtle,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(6px, 1vw, 12px)',
          padding: '7px 8px 7px clamp(12px, 1.5vw, 18px)',
          borderRadius: 20,
          border: `1px solid ${c.lineStrong}`,
          background: '#fff',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <span style={{ display: 'flex', color: c.textSubtle, flex: 'none' }}>
          <Icon name="Search" size={20} />
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitTraditionalSearch()
          }}
          placeholder={activeCategory?.placeholder ?? 'Search by product name or location…'}
          aria-label="Search"
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            fontSize: 16,
            color: c.ink,
            background: 'transparent',
            padding: '13px 0',
          }}
        />

        {/* Opens the conversational bar — the Google "AI Mode" pattern. Shares
            the shimmering gradient of the AI bar itself, so it reads as the
            AI entry point rather than a plain outline button. */}
        <button
          type="button"
          onClick={enterAiMode}
          title="Switch to AI search"
          aria-label="Switch to AI search"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 46,
            padding: '0 clamp(14px, 2vw, 22px)',
            border: 'none',
            borderRadius: 999,
            background: `linear-gradient(90deg,${c.cyan},${c.purple},${c.primary},${c.yellow},${c.cyan})`,
            backgroundSize: '200% 100%',
            animation: 'csShimmer 9s linear infinite',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            flex: 'none',
          }}
        >
          <Icon name="AutoAwesome" size={17} />
          <span data-hide-xs>AI Mode</span>
        </button>

        {/* Date / date-range picker. */}
        <div style={{ position: 'relative', flex: 'none' }}>
          <button
            type="button"
            onClick={() => setDatesOpen((o) => !o)}
            title="Choose dates"
            aria-label="Choose dates"
            aria-expanded={datesOpen}
            data-hover={dateLabel ? undefined : 'outline'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              height: 46,
              width: dateLabel ? 'auto' : 46,
              padding: dateLabel ? '0 clamp(12px, 1.6vw, 18px)' : 0,
              border: `1px solid ${dateLabel || datesOpen ? c.primary : c.lineStrong}`,
              borderRadius: 999,
              background: dateLabel ? c.primaryTint : '#fff',
              color: dateLabel ? c.primary : c.body,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              flex: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon name="Calendar" size={18} />
            {dateLabel}
          </button>

          {datesOpen && (
            <>
              <div
                onClick={() => setDatesOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 30 }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 10px)',
                  right: 0,
                  zIndex: 31,
                  width: 300,
                  padding: 16,
                  borderRadius: 16,
                  border: `1px solid ${c.line}`,
                  background: '#fff',
                  boxShadow: '0 -20px 45px -20px rgba(39,42,70,.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 500, color: c.textMuted }}>
                      Check-in
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: c.ink }}>
                      {startDate ? formatShortDate(startDate) : 'Select'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 500, color: c.textMuted }}>
                      Check-out <span style={{ color: c.textFaint }}>(optional)</span>
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: c.ink }}>
                      {endDate ? formatShortDate(endDate) : 'Select'}
                    </span>
                  </div>
                </div>

                <CalendarGrid
                  startDate={startDate}
                  endDate={endDate}
                  onPick={(iso) => {
                    if (!startDate || (startDate && endDate)) {
                      setSearchDates(iso, '')
                    } else if (iso < startDate) {
                      setSearchDates(iso, endDate)
                    } else {
                      setSearchDates(startDate, iso)
                    }
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <button
                    type="button"
                    onClick={() => setSearchDates('', '')}
                    data-hover="text"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: c.textSubtle,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatesOpen(false)}
                    data-hover="primary"
                    style={{
                      height: 36,
                      padding: '0 18px',
                      border: 'none',
                      borderRadius: 999,
                      background: c.primary,
                      color: '#fff',
                      fontSize: 13.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={submitTraditionalSearch}
          data-hover="primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 46,
            padding: '0 clamp(14px, 2vw, 22px)',
            border: 'none',
            borderRadius: 999,
            background: c.primary,
            color: '#fff',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            flex: 'none',
          }}
        >
          Search
        </button>
      </div>
    </div>
  )
}

/** The gradient-ringed natural-language search bar. */
function AskBar() {
  const { query, setQuery, openVoice, askSuggestion } = useApp()
  const navigate = useNavigate()

  // Submits a query and navigates to the full AI search page, where the plan
  // renders alongside a side chat the traveller can keep talking to.
  const askAndOpen = (text: string) => {
    if (!text.trim()) return
    askSuggestion(text)
    navigate(`/search?q=${encodeURIComponent(text)}`)
  }

  const ask = () => askAndOpen(query)

  return (
    <div>
      <div
        style={{
          padding: 2,
          borderRadius: 999,
          background: `linear-gradient(90deg,${c.cyan},${c.purple},${c.primary},${c.yellow},${c.cyan})`,
          backgroundSize: '200% 100%',
          animation: 'csShimmer 9s linear infinite',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1vw, 12px)',
            padding: '7px 8px 7px clamp(12px, 1.5vw, 18px)',
            borderRadius: 999,
            background: '#fff',
          }}
        >
          <span style={{ display: 'flex', color: c.primary, flex: 'none' }}>
            <Icon name="AutoMode" size={22} />
          </span>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') ask()
            }}
            placeholder="Ask anything — “10 days in February, beaches and tea country, two people, under $2,500”"
            aria-label="Ask the AI travel agent"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              color: c.ink,
              background: 'transparent',
              padding: '13px 0',
            }}
          />

          {/* Dropped on phones so the input keeps a usable width. */}
          <button
            type="button"
            onClick={openVoice}
            title="Ask by voice"
            aria-label="Ask by voice"
            data-hover="outline"
            data-hide-xs
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              border: `1px solid ${c.lineStrong}`,
              borderRadius: 999,
              background: '#fff',
              color: c.body,
              cursor: 'pointer',
              flex: 'none',
            }}
          >
            <Icon name="Mood" size={19} />
          </button>

          <button
            type="button"
            onClick={ask}
            data-hover="primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 46,
              padding: '0 clamp(14px, 2vw, 22px)',
              border: 'none',
              borderRadius: 999,
              background: c.primary,
              color: '#fff',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              flex: 'none',
            }}
          >
            Ask
            <span style={{ fontSize: 15, lineHeight: 1 }}>↗</span>
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 14,
        }}
      >
        {SEARCH_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            // Fills the input rather than searching immediately — the
            // traveller can tweak the suggestion before hitting "Ask".
            onClick={() => setQuery(chip)}
            data-hover="outline"
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: `1px solid ${c.lineStrong}`,
              background: c.page,
              color: c.body,
              fontSize: 13.5,
              cursor: 'pointer',
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Thinking() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 24,
        paddingTop: 22,
        borderTop: `1px solid ${c.lineSoft}`,
        fontSize: 14,
        color: c.textSubtle,
      }}
    >
      <span style={{ display: 'flex', gap: 5 }}>
        {[c.cyan, c.primary, c.yellow].map((dot, i) => (
          <span
            key={dot}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: dot,
              animation: `csDot 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </span>
      Reading 1,400 stays, 620 activities and this month&apos;s monsoon data…
    </div>
  )
}

export function Results() {
  const { criteria, typedAnswer, streaming, results, addToCart, askSuggestion } = useApp()

  return (
    <div style={{ marginTop: 24, animation: 'csRise .4s ease both' }}>
      {/* AI overview */}
      <div
        style={{
          borderRadius: 20,
          background: 'linear-gradient(180deg,#f2f8fb 0%,#fdfaf6 70%,#fff 100%)',
          border: '1px solid #eaf1f5',
          padding: 22,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'flex', color: c.cyan }}>
            <Icon name="AutoMode" size={19} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 600, color: c.ink }}>AI overview</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 6 }}>
            {criteria.map((label) => (
              <span
                key={label}
                style={{
                  padding: '4px 11px',
                  borderRadius: 999,
                  background: '#fff',
                  border: '1px solid #e6eef3',
                  color: c.cyanInk,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <p
          style={{
            fontSize: 16.5,
            lineHeight: 1.65,
            color: c.ink,
            maxWidth: 820,
            textWrap: 'pretty',
          }}
        >
          {typedAnswer}
          {streaming && (
            <span
              style={{
                display: 'inline-block',
                width: 9,
                color: c.primary,
                animation: 'csCaret 1s step-end infinite',
              }}
            >
              ▍
            </span>
          )}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {['Live rates & availability', 'Monsoon & weather data', '26,400 verified reviews'].map(
            (source) => (
              <span
                key={source}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: '#fff',
                  border: '1px solid #eee9e3',
                  fontSize: 12,
                  color: c.textMuted,
                }}
              >
                {source}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Ranked results — the same cards used on the Stays/Activities/Packages pages. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
          marginTop: 16,
        }}
      >
        {results.map((r) => {
          const kind = kindOf(r.kind)
          return (
            <CatalogueCard
              key={r.id}
              id={r.id}
              category={CATEGORY_OF_KIND[r.kind]}
              slotId={r.slotId}
              placeholder={r.name}
              badgeLabel={`${r.kind} · ${r.matchLabel}`}
              badgeBg={kind.bg}
              badgeColor={kind.color}
              aiNote={r.note}
              price={r.price}
              unitLabel={`/ ${r.unit.replace(/^per /, '')}`}
              onAdd={() =>
                addToCart({
                  id: r.id,
                  kind: r.kind,
                  name: r.name,
                  meta: `${r.place} · ${r.unit}`,
                  price: r.price,
                  free: true,
                })
              }
            >
              <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>
                {r.name}
              </div>
              <div style={{ fontSize: 13.5, color: c.textSubtle }}>{r.place}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {r.reasons.map((reason) => (
                  <span
                    key={reason}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 5,
                      background: c.muted,
                      color: c.body,
                      fontSize: 12,
                    }}
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </CatalogueCard>
          )
        })}
      </div>

      {/* Follow-up questions */}
      <div style={{ marginTop: 20, borderTop: `1px solid ${c.lineSoft}`, paddingTop: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: c.ink, marginBottom: 10 }}>
          People also ask
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FOLLOW_UPS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => askSuggestion(question)}
              data-hover="text"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                padding: '13px 2px',
                border: 'none',
                borderBottom: `1px solid ${c.lineSoft}`,
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 15,
                color: c.body,
              }}
            >
              {question}
              <span style={{ fontSize: 18, color: '#c9c4be', fontWeight: 300 }}>+</span>
            </button>
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: c.textFaint }}>
          AI answers can be wrong — confirm dates, prices and visa rules before booking.
        </p>
      </div>
    </div>
  )
}
