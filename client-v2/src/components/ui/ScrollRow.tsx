import { useRef, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { c } from '@/lib/theme'

interface ScrollRowProps {
  children: ReactNode
  /** Width of one card/column, so the arrows know how far to scroll. */
  itemWidth: number
  gap: number
}

/** Horizontal single-row slider: hides the native scrollbar, adds prev/next arrow buttons instead. */
export function ScrollRow({ children, itemWidth, gap }: ScrollRowProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollByCards = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * (itemWidth + gap) * 2, behavior: 'smooth' })
  }

  const arrowBase = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: `1px solid ${c.line}`,
    background: '#fff',
    color: c.ink,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 10px 26px -12px rgba(39,42,70,.4)',
    zIndex: 2,
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={trackRef}
        className="cs-hidebar"
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: itemWidth,
          gap,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          paddingBottom: 4,
        }}
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByCards(-1)}
        data-hover="outline"
        style={{ ...arrowBase, left: -8 }}
      >
        <Icon name="ChevronLeft" size={20} />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByCards(1)}
        data-hover="outline"
        style={{ ...arrowBase, right: -8 }}
      >
        <Icon name="ChevronRight" size={20} />
      </button>
    </div>
  )
}
