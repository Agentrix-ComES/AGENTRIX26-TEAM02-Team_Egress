import { c } from '@/lib/theme'

const COLUMNS = [
  {
    title: 'Book',
    links: [
      { href: '#stays', label: 'Stays' },
      { href: '#activities', label: 'Activities' },
      { href: '#packages', label: 'Packages' },
      { href: '#search', label: 'Transfers' },
    ],
  },
  {
    title: 'AI agent',
    links: [
      { href: '#companion', label: 'Live companion' },
      { href: '#plans', label: 'Plans & trial' },
      { href: '#companion', label: 'Voice guide' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '#', label: 'WhatsApp +94 77 000 0000' },
      { href: '#', label: 'hello@ceylontrips.lk' },
      { href: '#', label: 'Live chat, 24/7' },
    ],
  },
]

const linkStyle = { color: 'rgba(255,255,255,.62)' }

export function Footer() {
  return (
    <footer style={{ background: c.navy, padding: '56px var(--page-pad) 32px' }}>
      <div
        data-grid="footer"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: 40,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14 }}>
            <img src="/logo.png" alt="ceylontrips" style={{ height: 48, width: 'auto', marginRight: -6 }} />
            <span style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>
              ceylon<span style={{ color: c.primarySoft }}>trips</span>
            </span>
          </div>
          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,.6)',
              maxWidth: 280,
            }}
          >
            Book Sri Lanka the traditional way, or let the AI agent plan and run the whole trip.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div
            key={column.title}
            style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5 }}
          >
            <span style={{ fontWeight: 600, color: '#fff' }}>{column.title}</span>
            {column.links.map((link, i) => (
              <a key={`${link.label}-${i}`} href={link.href} style={linkStyle}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div
        style={{
          margin: '40px 0 0',
          paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,.12)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 24,
          fontSize: 13,
          color: 'rgba(255,255,255,.42)',
          flexWrap: 'wrap',
        }}
      >
        <span>© 2026 CeylonTrips · SLTDA licensed</span>
        <span>
          AI features use availability, weather and public news data. Always confirm before you pay.
        </span>
      </div>
    </footer>
  )
}
