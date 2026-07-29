import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

const MENU_ITEMS: { label: string; icon: IconName }[] = [
  { label: 'Profile', icon: 'Person' },
  { label: 'Account settings', icon: 'Settings' },
  { label: 'Billing', icon: 'CreditCard' },
]

export function ProfileMenu() {
  const { user, logout } = useApp()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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

  if (!user) return null

  const initial = user.name.trim().charAt(0).toUpperCase() || 'U'

  return (
    <div ref={rootRef} style={{ position: 'relative', flex: 'none' }}>
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-hover="outline"
        data-hide-sm
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          border: 'none',
          borderRadius: 999,
          background: c.primary,
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          flex: 'none',
        }}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: 264,
            maxWidth: '90vw',
            background: 'rgba(255,255,255,.86)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,.6)',
            borderRadius: 20,
            boxShadow: '0 28px 60px -24px rgba(39,42,70,.4), 0 2px 8px rgba(39,42,70,.06)',
            overflow: 'hidden',
            zIndex: 50,
            animation: 'csRise .18s ease both',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px',
              background: `linear-gradient(135deg,${c.primaryTint},rgba(255,255,255,0))`,
              borderBottom: `1px solid ${c.lineSoft}`,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: 42,
                borderRadius: 999,
                background: c.primary,
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                flex: 'none',
                boxShadow: '0 6px 14px -4px rgba(212,38,79,.55)',
              }}
            >
              {initial}
            </span>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: c.ink,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  marginTop: 1,
                  fontSize: 12,
                  color: c.textMuted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </p>
            </div>
          </div>

          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {MENU_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => setOpen(false)}
                data-hover="muted"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  width: '100%',
                  padding: '9px 10px',
                  border: 'none',
                  borderRadius: 11,
                  background: 'transparent',
                  color: c.ink,
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background .12s ease',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    background: c.muted,
                    flex: 'none',
                  }}
                >
                  <Icon name={item.icon} size={15} color={c.body} />
                </span>
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '8px', borderTop: `1px solid ${c.lineSoft}` }}>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                logout()
              }}
              data-hover="danger"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                width: '100%',
                padding: '9px 10px',
                border: 'none',
                borderRadius: 11,
                background: 'transparent',
                color: '#c53434',
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background .12s ease',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  background: 'rgba(197,52,52,.1)',
                  flex: 'none',
                }}
              >
                <Icon name="Logout" size={15} color="#c53434" />
              </span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
