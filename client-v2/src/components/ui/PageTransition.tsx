import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { c } from '@/lib/theme'

const BAR_STEP_MS = 260
const BAR_HOLD_MS = 220

/**
 * Thin progress bar across the top of the viewport, shown briefly on every
 * route change — the "loading" cue for a navigation that's otherwise
 * instant (all data here is local), so a page swap still reads as something
 * happening rather than a silent jump cut.
 */
export function TopLoadingBar() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timers: number[] = []
    setProgress(15)
    timers.push(window.setTimeout(() => setProgress(75), 50))
    timers.push(window.setTimeout(() => setProgress(100), BAR_STEP_MS))
    timers.push(window.setTimeout(() => setProgress(0), BAR_STEP_MS + BAR_HOLD_MS))
    return () => timers.forEach(window.clearTimeout)
  }, [location.pathname, location.search])

  if (!progress) return null

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${c.cyan}, ${c.primary})`,
          opacity: progress === 100 ? 0 : 1,
          transition:
            progress === 100 ? 'width .15s ease, opacity .25s ease .1s' : 'width .35s ease',
        }}
      />
    </div>
  )
}

/**
 * Wraps the routed page content: resets scroll to the top and fades/rises
 * the new page in on every navigation, so moving between routes feels like
 * one continuous transition rather than an abrupt swap.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div key={location.pathname} className="cs-route-in">
      {children}
    </div>
  )
}
