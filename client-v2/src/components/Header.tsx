import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useApp } from '@/state/store'
import { c } from '@/lib/theme'

const NAV = [
  { href: '#stays', label: 'Stays' },
  { href: '#activities', label: 'Activities' },
  { href: '#packages', label: 'Packages' },
  { href: '#planner', label: 'AI planner' },
  { href: '#companion', label: 'Live companion' },
  { href: '#plans', label: 'Pricing' },
]

export function Header() {
  const { toggleCart, cart, cartTotals, money, openLogin, openSignup } = useApp()
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
            gap: 20,
            fontSize: 15,
            fontWeight: 500,
            minWidth: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {NAV.map((item) => (
            <a key={item.href} href={item.href} style={{ color: c.body }} data-hover="text">
              {item.label}
            </a>
          ))}
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
            data-hover="outline"
            data-hide-sm
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              height: 36,
              padding: '0 15px',
              border: `1px solid ${c.lineStrong}`,
              borderRadius: 999,
              background: '#fff',
              color: c.body,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Icon name="Person" size={16} />
            Log in
          </button>

          <button
            type="button"
            onClick={toggleCart}
            data-hover="primary"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 36,
              padding: '0 16px',
              border: 'none',
              borderRadius: 999,
              background: c.primary,
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Icon name="ShoppingCart" size={17} />
            <span data-hide-xs>Cart · {money(cartTotals.total)}</span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20,
                height: 20,
                padding: '0 6px',
                borderRadius: 999,
                background: '#fff',
                color: c.primary,
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              {cart.length}
            </span>
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
                padding: '13px 4px',
                borderBottom: `1px solid ${c.line}`,
                color: c.body,
                fontSize: 15.5,
                fontWeight: 500,
              }}
              data-hover="text"
            >
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
