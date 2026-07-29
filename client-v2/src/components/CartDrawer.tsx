import { useNavigate } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { useApp } from '@/state/store'
import { c, kindOf } from '@/lib/theme'

export function CartDrawer() {
  const { cartOpen, toggleCart, cart, cartTotals, removeFromCart, money, openTourGuide } = useApp()
  const navigate = useNavigate()

  // Demo checkout: closes the drawer, lands on the AI search page, and
  // offers the tour guide popup so the trip doesn't go unmonitored.
  const checkout = () => {
    toggleCart()
    navigate('/search')
    openTourGuide()
  }

  if (!cartOpen) return null

  const lines = [
    { label: 'Subtotal', value: money(cartTotals.subtotal), color: c.body },
    { label: 'Taxes & service (6%)', value: money(cartTotals.fees), color: c.body },
    { label: 'Pay now, 20% deposit', value: money(cartTotals.deposit), color: c.textSubtle },
  ]

  return (
    <div
      onClick={toggleCart}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(13,13,17,.4)',
        backdropFilter: 'blur(3px)',
        animation: 'csFadeIn .2s ease both',
      }}
    >
      <div
        data-drawer
        role="dialog"
        aria-label="Your cart"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: '100%',
          background: '#fff',
          borderLeft: `1px solid ${c.line}`,
          boxShadow: '-24px 0 60px -30px rgba(39,42,70,.35)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'csSlideInRight .28s cubic-bezier(.2,.8,.2,1) both',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '20px 24px',
            borderBottom: `1px solid ${c.lineSoft}`,
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 10,
              background: c.primaryTint,
              color: c.primary,
              flex: 'none',
            }}
          >
            <Icon name="ShoppingCart" size={18} />
          </span>
          <span style={{ fontSize: 17, fontWeight: 600, color: c.ink }}>Your cart</span>
          {cart.length > 0 && (
            <span
              style={{
                padding: '3px 9px',
                borderRadius: 999,
                background: c.primaryTint,
                color: c.primaryHover,
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          )}
          <button
            type="button"
            onClick={toggleCart}
            aria-label="Close cart"
            data-hover="muted"
            style={{
              marginLeft: 'auto',
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              border: 'none',
              borderRadius: 8,
              background: c.muted,
              color: c.body,
              cursor: 'pointer',
            }}
          >
            <Icon name="Close" size={16} />
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
            <div
              style={{
                margin: 'auto',
                padding: '40px 0',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: c.muted,
                  color: c.textSubtle,
                  marginBottom: 16,
                }}
              >
                <Icon name="ShoppingCart" size={24} />
              </span>
              <p style={{ marginBottom: 8, fontSize: 15.5, fontWeight: 600, color: c.ink }}>
                Nothing in the cart yet
              </p>
              <p style={{ maxWidth: 280, fontSize: 14, lineHeight: 1.6, color: c.textMuted }}>
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
                data-cart-item
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 14,
                  border: `1px solid ${c.line}`,
                  borderRadius: 14,
                  background: c.page,
                }}
              >
                <span
                  style={{
                    flex: 'none',
                    width: 4,
                    borderRadius: 999,
                    background: kind.color,
                  }}
                />
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
                    aria-label={`Remove ${item.name}`}
                    data-hover="danger"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      border: 'none',
                      borderRadius: 7,
                      background: 'transparent',
                      color: c.textSubtle,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name="Delete" size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {cart.length > 0 && (
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
              onClick={checkout}
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
              Free cancellation on {cartTotals.freeCancelCount} of {cart.length} items. Pay in full
              or 20% deposit at checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
