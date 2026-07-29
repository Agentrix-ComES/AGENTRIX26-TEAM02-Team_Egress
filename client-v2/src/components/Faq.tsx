import { FAQS } from '@/data/content'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Faq() {
  const { openFaq, toggleFaq } = useApp()

  return (
    <section style={{ background: '#fff', padding: '88px var(--page-pad)' }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        <h2
          style={{
            marginBottom: 32,
            fontSize: 'clamp(26px, 3.4vw, 42px)',
            fontWeight: 500,
            letterSpacing: '-0.024em',
            color: c.ink,
            textAlign: 'center',
          }}
        >
          Before you book.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => {
            const open = openFaq === i
            return (
              <div
                key={faq.q}
                style={{
                  background: c.page,
                  border: `1px solid ${c.line}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={open}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '20px 22px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ flex: 1, fontSize: 16.5, fontWeight: 600, color: c.ink }}>
                    {faq.q}
                  </span>
                  <span
                    style={{ flex: 'none', fontSize: 13, fontWeight: 500, color: c.primary }}
                  >
                    {open ? 'Close' : 'Read'}
                  </span>
                </button>

                {open && (
                  <p
                    style={{
                      padding: '0 22px 22px',
                      fontSize: 15.5,
                      lineHeight: 1.65,
                      color: c.body,
                    }}
                  >
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
