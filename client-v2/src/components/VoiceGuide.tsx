import { Icon } from '@/components/ui/Icon'
import { VOICE_SCRIPT } from '@/data/content'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

const GREETING =
  "I'm with you for the whole trip. Ask me where you are, what to do next, or anything that's gone wrong — I know your bookings."

export function VoiceGuide() {
  const app = useApp()

  if (!app.voiceOpen) return <VoiceFab />

  // Greeting, then each asked question paired with its answer.
  const transcript = [
    { who: 'Guide', text: GREETING, mine: false },
    ...app.voiceTurns.flatMap((turn, i) => [
      { who: 'You', text: turn.q, mine: true, key: `q${i}` },
      { who: 'Guide', text: turn.a, mine: false, key: `a${i}` },
    ]),
  ]

  return (
    <div
      data-voice-panel
      role="dialog"
      aria-label="Voice guide"
      style={{
        position: 'fixed',
        right: 28,
        bottom: 28,
        zIndex: 65,
        width: 392,
        maxHeight: '76vh',
        display: 'flex',
        flexDirection: 'column',
        background: c.dark,
        border: '1px solid rgba(255,255,255,.12)',
        borderRadius: 22,
        boxShadow: '0 32px 70px -30px rgba(13,13,17,.7)',
        overflow: 'hidden',
        animation: 'csRise .28s ease both',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,.1)',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 11,
            background: c.primary,
            color: '#fff',
          }}
        >
          <Icon name="Mood" size={19} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Nuwan · voice guide</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)' }}>
            {app.listening ? 'Listening…' : 'Live · knows your itinerary and bookings'}
          </div>
        </div>
        <button
          type="button"
          onClick={app.closeVoice}
          aria-label="Close voice guide"
          style={{
            width: 30,
            height: 30,
            border: 'none',
            borderRadius: 8,
            background: 'rgba(255,255,255,.1)',
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer',
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
                color: 'rgba(255,255,255,.35)',
              }}
            >
              {message.who}
            </span>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: message.mine ? c.primary : 'rgba(255,255,255,.08)',
                color: message.mine ? '#fff' : 'rgba(255,255,255,.9)',
                fontSize: 14.5,
                lineHeight: 1.6,
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div className="cs-hidebar" style={{ display: 'flex', gap: 7, overflowX: 'auto' }}>
          {VOICE_SCRIPT.map((turn) => (
            <button
              key={turn.short}
              type="button"
              onClick={() => app.askVoice(turn)}
              style={{
                flex: 'none',
                whiteSpace: 'nowrap',
                padding: '7px 12px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,.2)',
                background: 'transparent',
                color: 'rgba(255,255,255,.8)',
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              {turn.short}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={app.toggleListening}
            aria-label={app.listening ? 'Stop listening' : 'Start listening'}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              border: 'none',
              borderRadius: '50%',
              background: app.listening ? c.primary : c.navy,
              color: '#fff',
              cursor: 'pointer',
              flex: 'none',
            }}
          >
            {app.listening && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: c.primary,
                  animation: 'csPulse 1.6s ease-out infinite',
                }}
              />
            )}
            <span
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                gap: 3,
                height: 24,
              }}
            >
              {[14, 20, 11, 18].map((height, i) => (
                <span
                  key={i}
                  style={{
                    width: 3,
                    borderRadius: 2,
                    background: '#fff',
                    height,
                    animation: `csBar .9s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </span>
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
              {app.listening ? 'Listening — speak now' : 'Tap to talk'}
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: 'rgba(255,255,255,.5)' }}>
              {app.listening
                ? 'Release nothing, just stop speaking. Sinhala, Tamil, English, German, French and Dutch.'
                : "Hands-free while you walk; works on 3G and caches today's briefing offline."}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['Hand to a human', 'Continue on WhatsApp'].map((label) => (
            <button
              key={label}
              type="button"
              data-hover="light-strong"
              style={{
                flex: 1,
                height: 38,
                border: '1px solid rgba(255,255,255,.2)',
                borderRadius: 8,
                background: 'transparent',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
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
      data-hover="ink"
      style={{
        position: 'fixed',
        right: 28,
        bottom: 28,
        zIndex: 55,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: 54,
        padding: '0 22px',
        border: 'none',
        borderRadius: 999,
        background: c.dark,
        color: '#fff',
        fontSize: 15,
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: '0 20px 44px -20px rgba(13,13,17,.6)',
      }}
    >
      <Icon name="Mood" size={20} />
      Ask your guide
    </button>
  )
}
