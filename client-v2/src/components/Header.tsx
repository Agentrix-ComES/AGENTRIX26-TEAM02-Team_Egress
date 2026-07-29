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
  const { openVoice, toggleCart, cart, cartTotals, money } = useApp()

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
          maxWidth: 'var(--page-max)',
          margin: '0 auto',
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
          className="cs-hidebar"
          style={{
            display: 'flex',
            gap: 20,
            fontSize: 15,
            fontWeight: 500,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflowX: 'auto',
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
          {/* Redundant on small screens — the floating guide button covers it. */}
          <button
            type="button"
            onClick={openVoice}
            data-hover="outline"
            data-hide-sm
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              height: 36,
              padding: '0 14px',
              border: `1px solid ${c.lineStrong}`,
              borderRadius: 999,
              background: '#fff',
              color: c.body,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Icon name="Mood" size={17} />
            Voice guide
          </button>

          <button
            type="button"
            onClick={toggleCart}
            data-hover="ink"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 36,
              padding: '0 16px',
              border: 'none',
              borderRadius: 999,
              background: c.ink,
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cart · {money(cartTotals.total)}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20,
                height: 20,
                padding: '0 6px',
                borderRadius: 999,
                background: c.primary,
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              {cart.length}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
