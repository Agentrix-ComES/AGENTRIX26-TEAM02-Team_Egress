import { Icon, type IconName } from '@/components/ui/Icon'
import { c } from '@/lib/theme'

export interface ChatMessage {
  key?: string | number
  who: string
  text: string
  mine?: boolean
}

export interface ChatSuggestion {
  key: string
  label: string
  onClick: () => void
}

interface ChatPanelProps {
  /** Used when `avatarSrc` isn't given. */
  icon?: IconName
  /** Image (e.g. the brand mark) shown in the avatar instead of `icon`. */
  avatarSrc?: string
  title: string
  subtitle: string
  /** Small green dot on the avatar — used for "live" personas like the guide. */
  liveDot?: boolean
  onClose: () => void
  closeLabel?: string
  messages: ChatMessage[]
  /** The question just asked, shown as a bubble while `thinking` is true. */
  pendingQuestion?: string | null
  thinking?: boolean
  /** Shown in the transcript area when there are no messages yet and nothing is pending. */
  emptyHint?: string
  suggestions?: ChatSuggestion[]
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  placeholder: string
}

/**
 * The chat widget shared by every AI conversation surface in the app — the
 * "Nuwan" trip guide and the AI search assistant both render this, just with
 * different persona, transcript and send behaviour wired in.
 */
export function ChatPanel({
  icon,
  avatarSrc,
  title,
  subtitle,
  liveDot,
  onClose,
  closeLabel = 'Close chat',
  messages,
  pendingQuestion,
  thinking,
  emptyHint,
  suggestions,
  draft,
  onDraftChange,
  onSend,
  placeholder,
}: ChatPanelProps) {
  const showEmptyHint = messages.length === 0 && !thinking

  return (
    <>
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
        <span style={{ position: 'relative', width: 42, height: 42, flex: 'none' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: avatarSrc ? '#fff' : c.primary,
              border: avatarSrc ? `1px solid ${c.primary}` : 'none',
              boxShadow: avatarSrc ? 'none' : `0 6px 16px -6px ${c.primary}`,
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
            ) : (
              icon && <Icon name={icon} size={21} />
            )}
          </span>
          {liveDot && (
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
          )}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: c.ink }}>{title}</div>
          <div style={{ fontSize: 12.5, color: c.textSubtle }}>{subtitle}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
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
        {showEmptyHint && emptyHint && (
          <p style={{ fontSize: 13.5, color: c.textSubtle, lineHeight: 1.6 }}>{emptyHint}</p>
        )}

        {messages.map((message, i) => (
          <ChatBubble key={message.key ?? i} who={message.who} text={message.text} mine={message.mine} />
        ))}

        {/* Question lands instantly; the assistant thinks for a beat before answering. */}
        {thinking && pendingQuestion && (
          <>
            <ChatBubble who="You" text={pendingQuestion} mine />
            <div style={{ alignSelf: 'flex-start' }}>
              <ThinkingDots />
            </div>
          </>
        )}

        {/* Suggested questions, offered inline as part of the chat itself rather than a
            separate toolbar — they fall away once the traveller starts asking their own.
            Visibility is the caller's call (e.g. "no real turns yet"), not tied to
            `messages` here since a standing greeting keeps that list non-empty. */}
        {!thinking && suggestions && suggestions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
            {suggestions.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={s.onClick}
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
                {s.label}
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
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSend()
            }}
            disabled={!!thinking}
            placeholder={placeholder}
            aria-label={placeholder}
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
            onClick={onSend}
            aria-label="Send"
            data-hover="primary"
            disabled={!draft.trim() || !!thinking}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              flex: 'none',
              border: 'none',
              borderRadius: '50%',
              background: draft.trim() && !thinking ? c.primary : c.muted,
              color: draft.trim() && !thinking ? '#fff' : c.textFaint,
              cursor: draft.trim() && !thinking ? 'pointer' : 'default',
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>↗</span>
          </button>
        </div>
      </div>
    </>
  )
}

function ChatBubble({ who, text, mine }: { who: string; text: string; mine?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignSelf: mine ? 'flex-end' : 'flex-start',
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
        {who}
      </span>
      <div
        style={{
          padding: '13px 15px',
          borderRadius: 15,
          background: mine ? c.primary : '#fff',
          border: mine ? 'none' : `1px solid ${c.line}`,
          boxShadow: mine ? 'none' : '0 1px 3px rgba(39,42,70,.06)',
          color: mine ? '#fff' : c.body,
          fontSize: 14.5,
          lineHeight: 1.6,
        }}
      >
        {text}
      </div>
    </div>
  )
}

/** The bouncing-dot "AI is thinking" indicator, styled like a chat bubble. */
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
