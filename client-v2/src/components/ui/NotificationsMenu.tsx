import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { c } from '@/lib/theme'

interface Notification {
  id: string
  title: string
  body: string
  time: string
  unread: boolean
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Kandy transfer delayed',
    body: 'Road traffic near Peradeniya adds ~20 min. Your dinner booking still fits.',
    time: '12m ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Temple etiquette reminder',
    body: 'Shoulders and knees covered for tomorrow’s Temple of the Tooth visit.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Weather watch: Ella hike',
    body: 'Light rain expected after 3pm — an earlier start is recommended.',
    time: 'Yesterday',
    unread: false,
  },
]

export function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} style={{ position: 'relative', flex: 'none' }}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-hover="outline"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          border: `1px solid ${c.lineStrong}`,
          borderRadius: 999,
          background: '#fff',
          color: c.ink,
          cursor: 'pointer',
          flex: 'none',
        }}
      >
        <Icon name="Notifications" size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              borderRadius: 999,
              background: c.primary,
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 700,
              border: '1px solid #fff',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 340,
            maxWidth: '90vw',
            background: '#fff',
            border: `1px solid ${c.line}`,
            borderRadius: 14,
            boxShadow: '0 22px 48px -24px rgba(39,42,70,.35)',
            overflow: 'hidden',
            zIndex: 50,
            whiteSpace: 'normal',
            animation: 'csFadeIn .15s ease both',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: `1px solid ${c.lineSoft}`,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: c.ink }}>Notifications</span>
            {unreadCount > 0 && (
              <span style={{ fontSize: 12.5, fontWeight: 500, color: c.primary }}>
                {unreadCount} new
              </span>
            )}
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {NOTIFICATIONS.length === 0 ? (
              <p
                style={{
                  padding: '28px 16px',
                  textAlign: 'center',
                  fontSize: 13.5,
                  color: c.textMuted,
                }}
              >
                You're all caught up.
              </p>
            ) : (
              NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '12px 16px',
                    borderBottom: `1px solid ${c.lineSoft}`,
                    background: n.unread ? c.primaryTint : 'transparent',
                  }}
                >
                  <span
                    style={{
                      flex: 'none',
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      marginTop: 6,
                      background: n.unread ? c.primary : 'transparent',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: c.ink }}>{n.title}</p>
                    <p
                      style={{
                        marginTop: 2,
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        color: c.textMuted,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {n.body}
                    </p>
                    <p style={{ marginTop: 4, fontSize: 11.5, color: c.textFaint }}>{n.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
