import { useApp } from '@/state/store'
import { c, kindOf } from '@/lib/theme'

export function CartDrawer() {
  const { cartOpen, toggleCart, cart, cartTotals, removeFromCart, money } = useApp()

  if (!cartOpen) return null

  const lines = [
    { label: 'Subtotal', value: money(cartTotals.subtotal), color: c.body },
    { label: 'Taxes & service (6%)', value: money(cartTotals.fees), color: c.body },
    { label: 'Pay now, 20% deposit', value: money(cartTotals.deposit), color: c.textSubtle },
  ]

  return (
    <div
      data-drawer
      role="dialog"
      aria-label="Your cart"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 420,
        zIndex: 60,
        background: '#fff',
        borderLeft: `1px solid ${c.line}`,
        boxShadow: '-24px 0 60px -30px rgba(39,42,70,.35)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'csRise .25s ease both',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '22px 24px',
          borderBottom: `1px solid ${c.lineSoft}`,
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 600, color: c.ink }}>Your cart</span>
        <span
          style={{
            padding: '3px 9px',
            borderRadius: 5,
            background: c.muted,
            color: c.textMuted,
            fontSize: 11.5,
            fontWeight: 500,
          }}
        >
          {cart.length} items
        </span>
        <button
          type="button"
          onClick={toggleCart}
          aria-label="Close cart"
          style={{
            marginLeft: 'auto',
            width: 30,
            height: 30,
            border: 'none',
            borderRadius: 8,
            background: c.muted,
            color: c.body,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      <div
        className="cs-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {cart.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <p style={{ marginBottom: 8, fontSize: 15.5, fontWeight: 500, color: c.ink }}>
              Nothing in the cart yet
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: c.textMuted }}>
              Add a stay, an activity or a whole AI itinerary — everything checks out together in
              one payment.
            </p>
          </div>
        )}

        {cart.map((item) => {
          const kind = kindOf(item.kind)
          return (
            <div
              key={item.key}
              style={{
                display: 'flex',
                gap: 12,
                padding: 14,
                border: `1px solid ${c.line}`,
                borderRadius: 14,
                background: c.page,
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 5,
                    background: kind.bg,
                    color: kind.color,
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    textTransform: 'uppercase',
                    alignSelf: 'flex-start',
                  }}
                >
                  {item.kind}
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: c.ink, lineHeight: 1.3 }}>
                  {item.name}
                </span>
                <span style={{ fontSize: 13, color: c.textSubtle }}>{item.meta}</span>
              </div>
              <div
                style={{
                  flex: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 15.5, fontWeight: 600, color: c.ink }}>
                  {money(item.price)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.key)}
                  data-hover="text"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: c.textSubtle,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          padding: '20px 24px',
          borderTop: `1px solid ${c.lineSoft}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lines.map((line) => (
            <div
              key={line.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                fontSize: 14,
                color: line.color,
              }}
            >
              <span>{line.label}</span>
              <span style={{ fontWeight: 500 }}>{line.value}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            paddingTop: 12,
            borderTop: `1px solid ${c.lineSoft}`,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: c.ink }}>Total</span>
          <span style={{ fontSize: 20, fontWeight: 600, color: c.ink }}>
            {money(cartTotals.total)}
          </span>
        </div>

        <button
          type="button"
          data-hover="primary"
          style={{
            height: 48,
            border: 'none',
            borderRadius: 8,
            background: c.primary,
            color: '#fff',
            fontSize: 15.5,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Checkout
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {['Hold 24h', 'Request a quote'].map((label) => (
            <button
              key={label}
              type="button"
              data-hover="outline"
              style={{
                flex: 1,
                height: 40,
                border: `1px solid ${c.lineStrong}`,
                borderRadius: 8,
                background: '#fff',
                color: c.body,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 12, lineHeight: 1.5, color: c.textFaint }}>
          Free cancellation on {cartTotals.freeCancelCount} of {cart.length} items. Pay in full or
          20% deposit at checkout.
        </p>
      </div>
    </div>
  )
}
