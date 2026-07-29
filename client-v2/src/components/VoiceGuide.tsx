import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { VOICE_SCRIPT } from '@/data/content'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

const GREETING =
  "I'm with you for the whole trip. Ask me where you are, what to do next, or anything that's gone wrong — I know your bookings."

const NUDGE = "Planning a Sri Lanka trip? I can help with routes, weather, temples and bookings."
const NUDGE_DELAY_MS = 8000
const NUDGE_THINK_MS = 1100

export function VoiceGuide() {
  const app = useApp()
  const [draft, setDraft] = useState('')
  const [nudgeOpen, setNudgeOpen] = useState(false)
  const nudgeShownRef = useRef(false)

  // Proactive nudge: once, after a pause on the page, if nobody's opened the guide yet.
  useEffect(() => {
    if (app.voiceOpen || nudgeShownRef.current) return
    const timer = window.setTimeout(() => {
      nudgeShownRef.current = true
      setNudgeOpen(true)
    }, NUDGE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [app.voiceOpen])

  if (!app.voiceOpen) {
    return (
      <>
        {nudgeOpen && (
          <VoiceNudge
            onOpen={() => {
              setNudgeOpen(false)
              app.openVoice()
            }}
            onDismiss={() => setNudgeOpen(false)}
          />
        )}
        <VoiceFab />
      </>
    )
  }

  // Greeting, then each asked question paired with its answer.
  const transcript = [
    { who: 'Guide', text: GREETING, mine: false },
    ...app.voiceTurns.flatMap((turn, i) => [
      { who: 'You', text: turn.q, mine: true, key: `q${i}` },
      { who: 'Guide', text: turn.a, mine: false, key: `a${i}` },
    ]),
  ]

  const send = () => {
    if (!draft.trim() || app.voicePending) return
    app.askVoiceText(draft)
    setDraft('')
  }

  return (
    <div
      onClick={app.closeVoice}
      style={{
        position: 'fixed',
        top: 'var(--header-h)',
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 35,
        background: 'transparent',
      }}
    >
      <div
        data-voice-panel
        role="dialog"
        aria-label="Voice guide"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: c.card,
          borderLeft: `1px solid ${c.line}`,
          boxShadow: '-24px 0 60px -30px rgba(39,42,70,.35)',
          overflow: 'hidden',
          animation: 'csSlideInRight .28s cubic-bezier(.2,.8,.2,1) both',
        }}
      >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          padding: '20px 22px',
          background: c.page,
          borderBottom: `1px solid ${c.line}`,
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: c.primary,
            boxShadow: `0 6px 16px -6px ${c.primary}`,
            color: '#fff',
            flex: 'none',
          }}
        >
          <Icon name="Explore" size={21} />
          <span
            style={{
              position: 'absolute',
              right: -1,
              bottom: -1,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: c.green,
              border: `2px solid ${c.page}`,
            }}
          />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: c.ink }}>Nuwan · local guide</div>
          <div style={{ fontSize: 12.5, color: c.textSubtle }}>
            Live · knows your itinerary and bookings
          </div>
        </div>
        <button
          type="button"
          onClick={app.closeVoice}
          aria-label="Close voice guide"
          data-hover="outline"
          style={{
            width: 32,
            height: 32,
            border: `1px solid ${c.lineStrong}`,
            borderRadius: 9,
            background: '#fff',
            color: c.body,
            fontSize: 14,
            cursor: 'pointer',
            flex: 'none',
          }}
        >
          ✕
        </button>
      </div>

      <div
        className="cs-scroll"
        style={{
          flex: '1 1 auto',
          minHeight: 190,
          overflowY: 'auto',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: c.page,
        }}
      >
        {transcript.map((message, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              alignSelf: message.mine ? 'flex-end' : 'flex-start',
              maxWidth: '86%',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                color: c.textFaint,
              }}
            >
              {message.who}
            </span>
            <div
              style={{
                padding: '13px 15px',
                borderRadius: 15,
                background: message.mine ? c.primary : '#fff',
                border: message.mine ? 'none' : `1px solid ${c.line}`,
                boxShadow: message.mine ? 'none' : '0 1px 3px rgba(39,42,70,.06)',
                color: message.mine ? '#fff' : c.body,
                fontSize: 14.5,
                lineHeight: 1.6,
              }}
            >
              {message.text}
            </div>
          </div>
        ))}

        {/* Question lands instantly; the guide thinks for a beat before answering. */}
        {app.voicePending && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'flex-end', maxWidth: '86%' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                  color: c.textFaint,
                }}
              >
                You
              </span>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: c.primary,
                  color: '#fff',
                  fontSize: 14.5,
                  lineHeight: 1.6,
                }}
              >
                {app.voicePending.q}
              </div>
            </div>
            <div style={{ alignSelf: 'flex-start' }}>
              <ThinkingDots />
            </div>
          </>
        )}

        {/* Suggested questions, offered inline as part of the chat itself rather than a
            separate toolbar — they fall away once the traveller starts asking their own. */}
        {app.voiceTurns.length === 0 && !app.voicePending && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
            {VOICE_SCRIPT.map((turn) => (
              <button
                key={turn.short}
                type="button"
                onClick={() => app.askVoice(turn)}
                data-hover="outline"
                style={{
                  padding: '7px 12px',
                  borderRadius: 999,
                  border: `1px solid ${c.lineStrong}`,
                  background: '#fff',
                  color: c.body,
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                {turn.short}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          padding: '16px 20px',
          borderTop: `1px solid ${c.lineSoft}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Type-to-ask input. */}
        <div
          className="cs-focus-ring"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 5px 5px 16px',
            border: `1px solid ${c.lineStrong}`,
            borderRadius: 999,
            background: '#fff',
            transition: 'border-color .15s ease, box-shadow .15s ease',
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            disabled={!!app.voicePending}
            placeholder={app.voicePending ? 'Nuwan is thinking…' : 'Type a question for your guide…'}
            aria-label="Type a question for your guide"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              fontSize: 14.5,
              color: c.ink,
              background: 'transparent',
              padding: '10px 0',
            }}
          />
          <button
            type="button"
            onClick={send}
            aria-label="Send"
            data-hover="primary"
            disabled={!draft.trim() || !!app.voicePending}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              flex: 'none',
              border: 'none',
              borderRadius: '50%',
              background: draft.trim() && !app.voicePending ? c.primary : c.muted,
              color: draft.trim() && !app.voicePending ? '#fff' : c.textFaint,
              cursor: draft.trim() && !app.voicePending ? 'pointer' : 'default',
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>↗</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

/** The bouncing-dot "AI is thinking" indicator, styled like a guide bubble. */
function ThinkingDots() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '14px 16px',
        borderRadius: 15,
        background: '#fff',
        border: `1px solid ${c.line}`,
        boxShadow: '0 1px 3px rgba(39,42,70,.06)',
      }}
    >
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
    </div>
  )
}

/** Floating button shown whenever the voice panel is closed. */
function VoiceFab() {
  const { openVoice } = useApp()

  return (
    <button
      type="button"
      onClick={openVoice}
      style={{
        position: 'fixed',
        right: 28,
        bottom: 28,
        zIndex: 55,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: 54,
        padding: '0 22px 0 18px',
        border: `1px solid ${c.line}`,
        borderRadius: 999,
        background: '#fff',
        color: c.ink,
        fontSize: 15,
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: '0 20px 44px -20px rgba(39,42,70,.35)',
        transition: 'transform .15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
    >
      <span
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: c.primary,
          flex: 'none',
        }}
      >
        <Icon name="Explore" size={16} color="#fff" />
        <span
          style={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: c.green,
            border: `2px solid #fff`,
          }}
        />
      </span>
      Ask your guide
    </button>
  )
}

/** Proactive prompt shown once above the fab, to draw people into the guide. */
function VoiceNudge({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
  const [ready, setReady] = useState(false)

  // A short "thinking" beat before the message reveals, so it reads as live, not canned.
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), NUDGE_THINK_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen()
      }}
      style={{
        position: 'fixed',
        right: 28,
        bottom: 96,
        zIndex: 56,
        width: 264,
        display: 'flex',
        gap: 10,
        alignItems: ready ? 'flex-start' : 'center',
        padding: ready ? '14px 14px 14px 16px' : '10px 14px',
        border: `1px solid ${c.line}`,
        borderRadius: 18,
        background: '#fff',
        boxShadow: '0 20px 44px -20px rgba(39,42,70,.35)',
        cursor: 'pointer',
        animation: 'csRise .28s ease both',
        transition: 'padding .2s ease',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: c.primary,
          color: '#fff',
          flex: 'none',
        }}
      >
        <Icon name="Explore" size={16} color="#fff" />
      </span>

      {ready ? (
        <>
          <p style={{ flex: 1, fontSize: 13.5, lineHeight: 1.5, color: c.body }}>{NUDGE}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDismiss()
            }}
            aria-label="Dismiss"
            style={{
              flex: 'none',
              width: 20,
              height: 20,
              border: 'none',
              borderRadius: 6,
              background: c.muted,
              color: c.textMuted,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[c.cyan, c.primary, c.yellow].map((dot, i) => (
            <span
              key={dot}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: dot,
                animation: `csDot 1s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </span>
      )}
    </div>
  )
}
