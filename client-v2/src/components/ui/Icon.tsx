/**
 * The icons the design uses, inlined as paths.
 *
 * The Figma export pulled these from the design-system bundle; inlining the
 * handful we actually need keeps client-v2 dependency-free. Add new glyphs to
 * PATHS (24×24 viewBox, Material Symbols outline) rather than importing a set.
 */
const PATHS = {
  /** Chat-bubble smile — the voice guide. */
  Mood: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm3.5-9a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm-7 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM12 17.5c2.03 0 3.8-1.11 4.75-2.75h-9.5c.95 1.64 2.72 2.75 4.75 2.75Z',
  /** Map pin. */
  LocationOn:
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z',
  /** Four-point sparkle — the AI marker. */
  AutoMode:
    'M12 1.5l2.05 5.6a5 5 0 0 0 2.85 2.85L22.5 12l-5.6 2.05a5 5 0 0 0-2.85 2.85L12 22.5l-2.05-5.6a5 5 0 0 0-2.85-2.85L1.5 12l5.6-2.05a5 5 0 0 0 2.85-2.85L12 1.5Z',
  /** Sun — weather watch. */
  LightMode:
    'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm-1-13h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.22 5.64l1.42-1.42 2.12 2.12-1.41 1.42L4.22 5.64Zm11.02 11.02 1.42-1.41 2.12 2.12-1.42 1.41-2.12-2.12ZM16.24 6.34l2.12-2.12 1.42 1.42-2.12 2.12-1.42-1.42ZM4.22 18.36l2.13-2.12 1.41 1.41-2.12 2.12-1.42-1.41Z',
  /** Shield with tick — safety & news scan. */
  Shield:
    'M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1.2 14.2L7 12.4l1.4-1.4 2.4 2.4 5-5L17.2 10l-6.4 6.2Z',
  /** Overlapping people — booking guard. */
  Diversity:
    'M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM5.5 11a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm13 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM12 12c2.7 0 5 1.6 5 3.6V19H7v-3.4C7 13.6 9.3 12 12 12ZM5.5 17c.7 0 1.4.1 2 .4-.3.5-.5 1.1-.5 1.7V21H1v-1.9C1 17.9 3 17 5.5 17Zm13 0c2.5 0 4.5.9 4.5 2.1V21h-6v-1.9c0-.6-.2-1.2-.5-1.7.6-.3 1.3-.4 2-.4Z',
} as const

export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName | string
  size?: number
  color?: string
}

export function Icon({ name, size = 18, color = 'currentColor' }: IconProps) {
  const path = PATHS[name as IconName]
  if (!path) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flex: 'none' }}
    >
      <path d={path} />
    </svg>
  )
}
