import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChatPanel } from '@/components/ui/ChatPanel'
import { SEARCH_CHIPS, VOICE_SCRIPT } from '@/data/content'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

// One persona, shown identically everywhere this widget opens from —
// the FAB, the guide flow, and the AI Mode search page all get the same
// title, icon and greeting.
const PERSONA_TITLE = 'AI trip assistant'
const PERSONA_SUBTITLE = 'Knows your trip, bookings and this plan'

const GREETING =
  "I'm with you for the whole trip. Ask me where you are, what to do next, or anything that's gone wrong — I know your bookings."

const NUDGE = "Planning a Sri Lanka trip? I can help with routes, weather, temples and bookings."
const NUDGE_DELAY_MS = 8000
const NUDGE_THINK_MS = 1100

/**
 * The one chat panel the whole app shares — the always-available trip
 * companion (opened from the FAB) and the AI Mode search follow-up chat both
 * open this same widget, with the same persona. Only the conversation
 * underneath differs: the general trip thread vs the search transcript.
 */
export function VoiceGuide() {
  const app = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [draft, setDraft] = useState('')
  const [nudgeOpen, setNudgeOpen] = useState(false)
  const nudgeShownRef = useRef(false)

  const searchMode = location.pathname === '/search'
  const panelOpen = app.voiceOpen || searchMode

  // Proactive nudge: once, after a pause on the page, if nobody's opened the guide yet.
  useEffect(() => {
    if (app.voiceOpen || nudgeShownRef.current) return
    const timer = window.setTimeout(() => {
      nudgeShownRef.current = true
      setNudgeOpen(true)
    }, NUDGE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [app.voiceOpen])

  if (!panelOpen) {
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

  const closePanel = searchMode ? () => navigate('/') : app.closeVoice
  const thinking = searchMode ? app.status === 'thinking' : !!app.voicePending
  const pendingQuestion = searchMode ? app.pendingQuery : (app.voicePending?.q ?? null)

  // Greeting, then each asked question paired with its answer — same shape
  // for both threads, just fed from a different source.
  const transcript = [
    { who: 'AI', text: GREETING, mine: false },
    ...(searchMode ? app.searchTurns : app.voiceTurns).flatMap((turn, i) => [
      { key: `q${i}`, who: 'You', text: turn.q, mine: true },
      { key: `a${i}`, who: 'AI', text: turn.a, mine: false },
    ]),
  ]

  const send = () => {
    if (!draft.trim() || thinking) return
    if (searchMode) app.askSuggestion(draft)
    else app.askVoiceText(draft)
    setDraft('')
  }

  const panel = (
    <div
      data-voice-panel
      role="dialog"
      aria-label={PERSONA_TITLE}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: searchMode ? 'fixed' : 'absolute',
        top: searchMode ? 'var(--header-h)' : 0,
        right: 0,
        bottom: 0,
        zIndex: searchMode ? 35 : undefined,
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
      <ChatPanel
        avatarSrc="/logo-copy.png"
        title={PERSONA_TITLE}
        subtitle={PERSONA_SUBTITLE}
        liveDot
        onClose={closePanel}
        closeLabel={`Close ${PERSONA_TITLE}`}
        messages={transcript}
        pendingQuestion={pendingQuestion}
        thinking={thinking}
        suggestions={
          searchMode
            ? app.searchTurns.length === 0 && !thinking
              ? SEARCH_CHIPS.map((chip) => ({
                  key: chip,
                  label: chip,
                  onClick: () => app.askSuggestion(chip),
                }))
              : undefined
            : app.voiceTurns.length === 0 && !thinking
              ? VOICE_SCRIPT.map((turn) => ({
                  key: turn.short,
                  label: turn.short,
                  onClick: () => app.askVoice(turn),
                }))
              : undefined
        }
        draft={draft}
        onDraftChange={setDraft}
        onSend={send}
        placeholder={thinking ? 'Thinking…' : 'Ask a question…'}
      />
    </div>
  )

  // Search mode: the AI search page (behind, z-index 30) is its own full
  // screen — no click-outside backdrop, or it'd swallow clicks and scroll
  // meant for the plan and close the page under the traveller.
  if (searchMode) return panel

  return (
    <div
      onClick={closePanel}
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
      {panel}
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
      <span style={{ position: 'relative', width: 28, height: 28, flex: 'none' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#fff',
            border: `1px solid ${c.primary}`,
            overflow: 'hidden',
          }}
        >
          <img src="/logo-copy.png" alt="" style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
        </span>
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
      Ask AI assistant
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
      <span style={{ position: 'relative', width: 30, height: 30, flex: 'none' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#fff',
            border: `1px solid ${c.primary}`,
            overflow: 'hidden',
          }}
        >
          <img src="/logo-copy.png" alt="" style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
        </span>
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
