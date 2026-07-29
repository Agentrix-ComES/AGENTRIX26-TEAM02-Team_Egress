import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { NotificationsMenu } from '@/components/ui/NotificationsMenu'
import { useApp } from '@/state/store'
import { c } from '@/lib/theme'

const NAV = [
  { href: '#stays', label: 'Stays' },
  { href: '#activities', label: 'Activities' },
  { href: '#packages', label: 'Packages' },
  { href: '#companion', label: 'AI Tour Guider', ai: true },
]

export function Header() {
  const { toggleCart, cart, openLogin, openSignup } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(253,250,246,.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${c.line}`,
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '0 var(--page-pad)',
          height: 'var(--header-h)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 2vw, 30px)',
        }}
      >
        <a
          href="#top"
          style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 'none' }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 10,
              background: c.primary,
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            c
          </span>
          <span
            style={{ fontSize: 18.5, fontWeight: 600, letterSpacing: -0.4, color: c.ink }}
          >
            ceylon<span style={{ color: c.primary }}>trips</span>
          </span>
        </a>

        <nav
          data-nav-desktop
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: 15,
            fontWeight: 500,
            minWidth: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {NAV.map((item) =>
            item.ai ? (
              <a
                key={item.href}
                href={item.href}
                data-hover="text"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px 5px 9px',
                  borderRadius: 999,
                  background: `linear-gradient(90deg,${c.cyanTint},${c.purpleTint})`,
                  border: `1px solid ${c.purple}55`,
                  color: c.purpleInk,
                  fontWeight: 600,
                }}
              >
                <Icon name="AutoAwesome" size={14} color={c.purple} />
                {item.label}
              </a>
            ) : (
              <a key={item.href} href={item.href} style={{ color: c.body }} data-hover="text">
                {item.label}
              </a>
            )
          )}
        </nav>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flex: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <button
            type="button"
            onClick={openLogin}
            aria-label="Log in"
            data-hover="outline"
            data-hide-sm
            style={{
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
            <Icon name="Person" size={16} />
          </button>

          <NotificationsMenu />

          <button
            type="button"
            onClick={toggleCart}
            aria-label="Cart"
            data-hover="primary"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              border: 'none',
              borderRadius: 999,
              background: c.primary,
              color: '#fff',
              cursor: 'pointer',
              flex: 'none',
            }}
          >
            <Icon name="ShoppingCart" size={17} />
            {cart.length > 0 && (
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
                  background: '#fff',
                  color: c.primary,
                  fontSize: 10.5,
                  fontWeight: 700,
                  border: `1px solid ${c.primary}`,
                }}
              >
                {cart.length}
              </span>
            )}
          </button>

          <button
            type="button"
            data-nav-toggle
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            data-hover="outline"
            style={{
              display: 'none',
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
            <Icon name={menuOpen ? 'Close' : 'Menu'} size={18} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          data-nav-mobile
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '4px var(--page-pad) 20px',
            borderTop: `1px solid ${c.line}`,
            background: c.card,
          }}
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '13px 4px',
                borderBottom: `1px solid ${c.line}`,
                color: item.ai ? c.purpleInk : c.body,
                fontSize: 15.5,
                fontWeight: item.ai ? 600 : 500,
              }}
              data-hover="text"
            >
              {item.ai && <Icon name="AutoAwesome" size={15} color={c.purple} />}
              {item.label}
            </a>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                openLogin()
              }}
              data-hover="outline"
              style={{
                flex: 1,
                height: 44,
                border: `1px solid ${c.lineStrong}`,
                borderRadius: 999,
                background: '#fff',
                color: c.ink,
                fontSize: 14.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                openSignup()
              }}
              data-hover="primary"
              style={{
                flex: 1,
                height: 44,
                border: 'none',
                borderRadius: 999,
                background: c.primary,
                color: '#fff',
                fontSize: 14.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Sign up
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
