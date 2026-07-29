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
  /** Three sparkles of different sizes — the classic "AI" glyph, used to badge AI-powered nav/features. */
  AutoAwesome:
    'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9Zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5ZM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15Z',
  /** Sun — weather watch. */
  LightMode:
    'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm-1-13h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.22 5.64l1.42-1.42 2.12 2.12-1.41 1.42L4.22 5.64Zm11.02 11.02 1.42-1.41 2.12 2.12-1.42 1.41-2.12-2.12ZM16.24 6.34l2.12-2.12 1.42 1.42-2.12 2.12-1.42-1.42ZM4.22 18.36l2.13-2.12 1.41 1.41-2.12 2.12-1.42-1.41Z',
  /** Shield with tick — safety & news scan. */
  Shield:
    'M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1.2 14.2L7 12.4l1.4-1.4 2.4 2.4 5-5L17.2 10l-6.4 6.2Z',
  /** Overlapping people — booking guard. */
  Diversity:
    'M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM5.5 11a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm13 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM12 12c2.7 0 5 1.6 5 3.6V19H7v-3.4C7 13.6 9.3 12 12 12ZM5.5 17c.7 0 1.4.1 2 .4-.3.5-.5 1.1-.5 1.7V21H1v-1.9C1 17.9 3 17 5.5 17Zm13 0c2.5 0 4.5.9 4.5 2.1V21h-6v-1.9c0-.6-.2-1.2-.5-1.7.6-.3 1.3-.4 2-.4Z',
  /** Compass — the travel guide identity, used on the voice-guide avatar and FAB. */
  Explore:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm4.5 3.5-6 2.5-2.5 6 6-2.5 2.5-6ZM12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  /** Shopping cart — the header cart button. */
  ShoppingCart:
    'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2ZM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1Zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2Z',
  /** Three lines — mobile nav toggle. */
  Menu: 'M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z',
  /** X — closes the mobile nav. */
  Close:
    'M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z',
  /** Trash bin — removes a cart line. */
  Delete:
    'M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10Zm-7 10h2V8h-2Zm4 0h2V8h-2ZM7 6v13Z',
  /** Person outline — login / account. */
  Person:
    'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v3h16v-3c0-2.76-3.58-5-8-5Z',
  /** Bell — notifications. */
  Notifications:
    'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2Zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z',
  /** Left chevron — slider "previous" arrow. */
  ChevronLeft: 'M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41Z',
  /** Right chevron — slider "next" arrow. */
  ChevronRight: 'M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41Z',
  /** Gear — account settings. */
  Settings:
    'M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.59-.22l-2.39.96a7.1 7.1 0 0 0-1.62-.94l-.36-2.54a.49.49 0 0 0-.48-.41h-3.84a.49.49 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.59.22L2.74 8.87a.5.5 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.5.5 0 0 0-.12-.61l-2.03-1.58ZM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2Z',
  /** Card — billing & payments. */
  CreditCard:
    'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 14H4v-6h16v6Zm0-10H4V6h16v2Z',
  /** Arrow out of a door — log out. */
  Logout:
    'M10.09 15.59 11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59ZM19 3H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z',
  /** Magnifying glass — plain keyword search. */
  Search:
    'M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19l-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z',
  /** Suitcase — the "Packages" search category. */
  Luggage:
    'M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2h3a2 2 0 0 1 2 2v2h1v2h-1v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10H3V8h1V6a2 2 0 0 1 2-2h3Zm2 0v2h2V4h-2ZM6 8v12h12V8H6Zm3 2h2v8H9v-8Zm4 0h2v8h-2v-8Z',
  /** Car — the "Transport" search category. */
  DirectionsCar:
    'M5 11 6.5 6.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H8a2 2 0 0 1-4 0H3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h2Zm1.5-.5h11l-1-3.5H7.5l-1 3.5ZM6 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
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
