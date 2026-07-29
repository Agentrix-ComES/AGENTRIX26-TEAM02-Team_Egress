import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { EmptyNote, Results, Thinking } from '@/components/SearchPanel'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'
import type { CartDraft } from '@/lib/types'

/**
 * Full-page AI search experience — its own route (`/search?q=...`), so it's
 * bookmarkable/shareable and survives a refresh. The plan renders here; the
 * chat itself is the same "Nuwan" widget (VoiceGuide) the rest of the app
 * uses, which shows itself automatically — in its AI-search persona —
 * whenever this route is active. The spacer on the right just reserves room
 * so the plan isn't hidden under it.
 */
export function AiSearchPage() {
  const app = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  // Direct load / refresh / shared link: the store has no transcript yet for
  // this query, so kick the same search a home-page "Ask" would have run.
  useEffect(() => {
    if (q && q !== app.query) app.askSuggestion(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the URL's q changes
  }, [q])

  const thinking = app.status === 'thinking'

  // Books the whole plan in one go — every result on screen, added as its
  // own cancellable cart line (same shape as a single card's "Add").
  const startTrip = () => {
    const drafts: CartDraft[] = app.results.map((r) => ({
      id: r.id,
      kind: r.kind,
      name: r.name,
      meta: `${r.place} · ${r.unit}`,
      price: r.price,
      free: true,
    }))
    app.addManyToCart(drafts)
  }

  return (
    <div
      role="dialog"
      aria-label="AI trip search"
      style={{
        position: 'fixed',
        top: 'var(--header-h)',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        display: 'flex',
        background: c.page,
        animation: 'csFadeIn .2s ease both',
      }}
    >
      {/* The plan */}
      <div
        className="cs-scroll"
        style={{ flex: '1 1 auto', minWidth: 0, overflowY: 'auto', padding: 'clamp(20px, 3vw, 40px)' }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            data-hover="text"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              background: 'transparent',
              color: c.textSubtle,
              fontSize: 13.5,
              cursor: 'pointer',
              marginBottom: 20,
              padding: 0,
            }}
          >
            <Icon name="ChevronLeft" size={16} />
            Back to search
          </button>

          <h1 style={{ fontSize: 'clamp(22px, 2.6vw, 30px)', fontWeight: 600, color: c.ink, margin: 0 }}>
            Your Sri Lanka plan
          </h1>
          <p style={{ fontSize: 14.5, color: c.textSubtle, marginTop: 6, marginBottom: 4 }}>
            Built from “{app.pendingQuery ?? app.query}” — keep chatting on the right to refine it.
          </p>

          {thinking && <Thinking />}
          {app.status === 'done' && <Results />}
          {app.status === 'empty' && <EmptyNote />}
        </div>
      </div>

      {/* Reserves the width VoiceGuide's panel occupies — it renders on top of this. */}
      <div aria-hidden style={{ width: 420, maxWidth: '38vw', flex: 'none' }} />

      {/* Floating over the plan's bottom-right corner — clear of the chat
          panel beside it, and never inside its transcript/output area. */}
      {app.status === 'done' && (
        <button
          type="button"
          onClick={startTrip}
          data-hover="primary"
          style={{
            position: 'absolute',
            right: 'calc(min(420px, 38vw) + 28px)',
            bottom: 28,
            zIndex: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            height: 52,
            padding: '0 22px',
            border: 'none',
            borderRadius: 999,
            background: c.primary,
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 20px 44px -20px rgba(39,42,70,.45)',
          }}
        >
          <Icon name="Luggage" size={19} />
          Start trip
        </button>
      )}

      {/* Opens the AI tour guide popup on the left — hidden once that panel
          is already open, since it'd sit right underneath. */}
      {app.status === 'done' && !app.tourGuideOpen && (
        <button
          type="button"
          onClick={app.openTourGuide}
          data-hover="outline"
          style={{
            position: 'absolute',
            left: 28,
            bottom: 28,
            zIndex: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            height: 52,
            padding: '0 22px',
            border: `1px solid ${c.lineStrong}`,
            borderRadius: 999,
            background: '#fff',
            color: c.ink,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 20px 44px -20px rgba(39,42,70,.35)',
          }}
        >
          <Icon name="Shield" size={19} color={c.green} />
          AI tour guide
        </button>
      )}
    </div>
  )
}
