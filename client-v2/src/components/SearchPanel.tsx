import { Icon } from '@/components/ui/Icon'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { MONTH_OPTIONS } from '@/data/catalogue'
import { FOLLOW_UPS, SEARCH_CHIPS, SEARCH_TABS } from '@/data/content'
import { config } from '@/lib/config'
import { c, kindOf } from '@/lib/theme'
import { useApp } from '@/state/store'

export function SearchPanel() {
  const app = useApp()
  const isAsk = app.tab === 'ask'

  return (
    <section id="search" style={{ padding: '0 var(--page-pad) 88px' }}>
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
          <div
            className="cs-hidebar"
            style={{
              display: 'flex',
              padding: 4,
              borderRadius: 999,
              background: c.muted,
              gap: 2,
              maxWidth: '100%',
              overflowX: 'auto',
            }}
          >
            {SEARCH_TABS.map((tab) => {
              const active = app.tab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => app.setTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    flex: 'none',
                    whiteSpace: 'nowrap',
                    padding: '8px 15px',
                    border: 'none',
                    borderRadius: 999,
                    fontSize: 13.5,
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: active ? '#fff' : 'transparent',
                    color: active ? (tab.id === 'ask' ? c.primary : c.ink) : c.textMuted,
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: c.textSubtle }}>
            Live inventory · prices in {config.currency}
          </span>
        </div>

        {isAsk ? <AskBar /> : <StructuredForm />}

        {app.status === 'thinking' && <Thinking />}
        {app.status === 'done' && <Results />}
        {app.status === 'empty' && (
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
        )}
      </div>
    </section>
  )
}

/** The gradient-ringed natural-language search bar. */
function AskBar() {
  const { query, setQuery, submitQuery, openVoice, askSuggestion } = useApp()

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
              if (e.key === 'Enter') submitQuery()
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
            onClick={submitQuery}
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {SEARCH_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => askSuggestion(chip)}
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

const fieldStyle = {
  height: 46,
  padding: '0 12px',
  border: `1px solid ${c.lineStrong}`,
  borderRadius: 8,
  fontSize: 14.5,
  color: c.ink,
  outline: 'none',
  background: '#fff',
} as const

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12.5,
  fontWeight: 500,
  color: c.textMuted,
} as const

/** Classic where/when/who search, shown on the non-AI tabs. */
function StructuredForm() {
  const app = useApp()

  const firstLabel =
    app.tab === 'activities'
      ? 'What do you want to do?'
      : app.tab === 'packages'
        ? 'Trip style'
        : 'Where to?'

  return (
    <div
      data-grid="search-form"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr .9fr auto',
        gap: 12,
        alignItems: 'end',
      }}
    >
      <label style={labelStyle}>
        {firstLabel}
        <input
          type="text"
          value={app.where}
          onChange={(e) => app.setWhere(e.target.value)}
          placeholder="Anywhere in Sri Lanka"
          style={fieldStyle}
        />
      </label>

      <label style={labelStyle}>
        Month
        <select
          value={app.month}
          onChange={(e) => app.setMonth(e.target.value)}
          style={fieldStyle}
        >
          {MONTH_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Nights
        <select
          value={app.nights}
          onChange={(e) => app.setNights(e.target.value)}
          style={fieldStyle}
        >
          {['3', '7', '10', '14'].map((n) => (
            <option key={n} value={n}>
              {n} nights
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Travellers
        <select value={app.pax} onChange={(e) => app.setPax(e.target.value)} style={fieldStyle}>
          <option value="1">1 adult</option>
          <option value="2">2 adults</option>
          <option value="4">Family of 4</option>
        </select>
      </label>

      <button
        type="button"
        onClick={app.submitForm}
        data-hover="ink"
        style={{
          height: 46,
          padding: '0 26px',
          border: 'none',
          borderRadius: 8,
          background: c.ink,
          color: '#fff',
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Search
      </button>
    </div>
  )
}

function Thinking() {
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

function Results() {
  const { criteria, typedAnswer, streaming, results, addToCart, askSuggestion, money } = useApp()

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

      {/* Ranked results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {results.map((r) => {
          const kind = kindOf(r.kind)
          return (
            <div
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: 14,
                border: `1px solid ${c.line}`,
                borderRadius: 18,
                background: '#fff',
                boxShadow: '0 12px 30px -26px rgba(39,42,70,.4)',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  flex: 'none',
                  width: 76,
                  height: 76,
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: c.photoBg,
                }}
              >
                <ImageSlot id={r.slotId} placeholder="Photo" radius={14} />
              </span>

              <div
                style={{
                  flex: 1,
                  minWidth: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 7,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 5,
                      background: kind.bg,
                      color: kind.color,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      textTransform: 'uppercase',
                    }}
                  >
                    {r.kind}
                  </span>
                  <span style={{ fontSize: 16.5, fontWeight: 600, color: c.ink }}>{r.name}</span>
                  <span style={{ fontSize: 13, color: c.textSubtle }}>{r.place}</span>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 5,
                      background: c.greenTint,
                      color: c.greenInk,
                      fontSize: 11.5,
                      fontWeight: 500,
                    }}
                  >
                    {r.matchLabel}
                  </span>
                </div>

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
              </div>

              <div
                style={{
                  flex: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 17, fontWeight: 600, color: c.ink }}>
                  from {money(r.price)}
                </span>
                <span style={{ fontSize: 12.5, color: c.textSubtle }}>{r.unit}</span>
              </div>

              <button
                type="button"
                data-hover="ink"
                onClick={() =>
                  addToCart({
                    id: r.id,
                    kind: r.kind,
                    name: r.name,
                    meta: `${r.place} · ${r.unit}`,
                    price: r.price,
                    free: true,
                  })
                }
                style={{
                  flex: 'none',
                  height: 36,
                  padding: '0 16px',
                  border: 'none',
                  borderRadius: 8,
                  background: c.ink,
                  color: '#fff',
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Add to cart
              </button>
            </div>
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
