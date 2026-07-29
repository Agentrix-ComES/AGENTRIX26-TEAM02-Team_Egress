import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Hero } from '@/components/Hero'
import { TraditionalBar } from '@/components/SearchPanel'
import { CatalogueCard } from '@/components/ui/CatalogueCard'
import { runTraditionalSearch } from '@/lib/search'
import { c } from '@/lib/theme'
import type { CatalogueSearchItem, TraditionalCategory } from '@/lib/types'
import { useApp } from '@/state/store'

const CATEGORY_LABELS: Record<string, string> = {
  stays: 'Stays',
  activities: 'Activities',
  packages: 'Packages',
  transport: 'Transport',
}

/** `2026-08-12` → `12 Aug 2026`. */
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

/**
 * Full-page traditional search — its own route (`/search/traditional`), so
 * it's bookmarkable/shareable and survives a refresh, same as `/search` and
 * `/listing/:category/:id`. Filters (text/category/date range) live in the
 * URL's query string, not app state.
 */
export function TraditionalSearchPage() {
  const app = useApp()
  const [searchParams, setSearchParams] = useSearchParams()

  const text = searchParams.get('text') ?? ''
  const category = (searchParams.get('category') as TraditionalCategory | null) ?? null
  const startDate = searchParams.get('start') ?? ''
  const endDate = searchParams.get('end') ?? ''

  // Direct load / refresh / shared link: hydrate the search bar's controlled
  // inputs from the URL so it shows the filters this page's results were
  // actually built from (the bar itself reads/writes app state, not the URL).
  useEffect(() => {
    if (text !== app.query) app.setQuery(text)
    if (category !== app.searchCategory) app.setSearchCategory(category)
    if (startDate !== app.searchStartDate || endDate !== app.searchEndDate) {
      app.setSearchDates(startDate, endDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the URL changes
  }, [text, category, startDate, endDate])

  // Category is a quick toggle, unlike the text/date fields — picking a new
  // tab up top re-filters the products below immediately, without waiting
  // for the traveller to press Search again.
  useEffect(() => {
    if (app.searchCategory === category) return
    const next = new URLSearchParams(searchParams)
    if (app.searchCategory) next.set('category', app.searchCategory)
    else next.delete('category')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the bar's own category state
  }, [app.searchCategory])

  const results = useMemo(
    () => runTraditionalSearch({ text, category, startDate, endDate }),
    [text, category, startDate, endDate],
  )

  const chips: string[] = []
  if (text.trim()) chips.push(`“${text.trim()}”`)
  if (category) chips.push(CATEGORY_LABELS[category])
  if (startDate) {
    chips.push(
      endDate && endDate !== startDate
        ? `${formatDate(startDate)} – ${formatDate(endDate)}`
        : formatDate(startDate),
    )
  }

  return (
    <>
      <Hero content={false} compact>
        <div
          style={{
            position: 'relative',
            background: 'rgba(255,255,255,.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,.5)',
            borderRadius: 26,
            boxShadow: '0 20px 45px -20px rgba(13,13,17,.45)',
            padding: 'clamp(14px, 2vw, 26px)',
          }}
        >
          <TraditionalBar />
        </div>
      </Hero>

      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: 'clamp(20px, 3vw, 40px)',
          paddingTop: 'clamp(8px, 1.2vw, 14px)',
        }}
      >
        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {chips.map((chip) => (
              <span
                key={chip}
                style={{
                  padding: '4px 11px',
                  borderRadius: 999,
                  background: '#fff',
                  border: `1px solid ${c.line}`,
                  color: c.body,
                  fontSize: 12.5,
                  fontWeight: 500,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {results.length ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
              marginTop: 16,
            }}
          >
            {results.map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p
            style={{
              marginTop: 16,
              paddingTop: 20,
              borderTop: `1px solid ${c.lineSoft}`,
              fontSize: 15,
              color: c.body,
            }}
          >
            Nothing matched that search. Try a different name or location, clear the category, or
            widen the date range.
          </p>
        )}
      </div>
    </>
  )
}

function ResultCard({ item }: { item: CatalogueSearchItem }) {
  const { addToCart, travellers } = useApp()

  const draft = () => {
    if (item.kind === 'Activity' || item.kind === 'Package') {
      return {
        id: item.id,
        kind: item.kind,
        name: item.name,
        meta: `${item.subtitle} · ${travellers} traveller${travellers === 1 ? '' : 's'}`,
        price: item.price * travellers,
        free: item.kind === 'Activity',
      }
    }
    return {
      id: item.id,
      kind: item.kind,
      name: item.name,
      meta: item.subtitle,
      price: item.price,
      free: true,
    }
  }

  return (
    <CatalogueCard
      id={item.id}
      category={item.category}
      slotId={item.slotId}
      placeholder={item.placeholder}
      badgeLabel={item.badgeLabel}
      badgeBg={item.badgeBg}
      badgeColor={item.badgeColor}
      aiNote={item.aiNote}
      price={item.price}
      unitLabel={item.unitLabel}
      onAdd={() => addToCart(draft())}
    >
      <div style={{ fontSize: 17, fontWeight: 600, color: c.ink, lineHeight: 1.25 }}>{item.name}</div>
      <div style={{ fontSize: 13.5, color: c.textSubtle }}>{item.subtitle}</div>
    </CatalogueCard>
  )
}
