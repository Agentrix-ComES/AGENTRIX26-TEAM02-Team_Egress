import type { CSSProperties, ReactNode } from 'react'

import { c } from '@/lib/theme'

interface SectionProps {
  id?: string
  background?: string
  /** Shorthand for the repeated `88px var(--page-pad)` block rhythm. */
  padding?: string
  children: ReactNode
  style?: CSSProperties
}

/** Full-bleed band with the standard 1240px centred column inside. */
export function Section({
  id,
  background,
  padding = '88px var(--page-pad)',
  children,
  style,
}: SectionProps) {
  return (
    <section id={id} style={{ background, padding, ...style }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>{children}</div>
    </section>
  )
}

interface SectionHeadProps {
  eyebrow: string
  eyebrowColor?: string
  title: string
  /** Right-hand supporting copy, or arbitrary controls (filters, tabs). */
  aside?: ReactNode
  dark?: boolean
  titleMaxWidth?: number
  marginBottom?: number
}

/** Eyebrow + big heading on the left, supporting copy or controls on the right. */
export function SectionHead({
  eyebrow,
  eyebrowColor,
  title,
  aside,
  dark = false,
  titleMaxWidth,
  marginBottom = 30,
}: SectionHeadProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 40,
        marginBottom,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: eyebrowColor ?? (dark ? c.yellow : c.primary),
            marginBottom: 12,
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            fontSize: 'clamp(26px, 3.4vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: '-0.024em',
            color: dark ? '#fff' : c.ink,
            maxWidth: titleMaxWidth,
          }}
        >
          {title}
        </h2>
      </div>
      {aside}
    </div>
  )
}

/** The muted paragraph that sits opposite most section headings. */
export function SectionAside({
  children,
  maxWidth = 340,
  dark = false,
}: {
  children: ReactNode
  maxWidth?: number
  dark?: boolean
}) {
  return (
    <p
      style={{
        maxWidth,
        fontSize: 15.5,
        lineHeight: 1.6,
        color: dark ? 'rgba(255,255,255,.68)' : c.textMuted,
      }}
    >
      {children}
    </p>
  )
}
