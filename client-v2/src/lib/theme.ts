/**
 * TS mirror of src/styles/tokens.css.
 *
 * Sections are laid out with inline style objects (the way the Figma export
 * was), so the palette needs to be reachable from TS. Import `c` rather than
 * pasting hex values into components.
 */
export const c = {
  // brand
  primary: '#d4264f',
  primaryHover: '#ab1e40',
  primarySoft: '#ec8299',
  primaryTint: '#fdeef2',

  // palette
  navy: '#272a46',
  yellow: '#f1ca01',
  green: '#00c580',
  greenInk: '#00a06a',
  greenTint: '#f2fbf7',
  cyan: '#01a1d2',
  cyanInk: '#0d6f9c',
  cyanTint: '#e6f7ff',
  purple: '#7f7ddf',
  purpleInk: '#5f5cc9',
  purpleTint: '#f3f2fb',
  amberInk: '#8a6d00',
  amberTint: '#fdf6e0',

  // surfaces
  page: '#fdfaf6',
  card: '#ffffff',
  muted: '#f6f4f1',
  dark: '#0d0d11',
  darkCard: '#16161c',
  photoBg: '#eef4f7',

  // text
  ink: '#0d0d11',
  body: '#434243',
  textMuted: '#81818b',
  textSubtle: '#a09b95',
  textFaint: '#b5b0aa',

  // lines
  line: '#f0ebe4',
  lineStrong: '#ece7e1',
  lineSoft: '#f4f0eb',
  lineFaint: '#f6f2ed',
  lineDashed: '#d9d4ce',
} as const

/** Section shell: 1240px centred column with responsive side padding. */
export const container = {
  maxWidth: 'var(--page-max)',
  margin: '0 auto',
} as const

/** Badge colours per cart/result line kind. */
export const kindStyle: Record<string, { bg: string; color: string }> = {
  Stay: { bg: c.cyanTint, color: c.cyanInk },
  Activity: { bg: c.greenTint, color: c.greenInk },
  Package: { bg: c.primaryTint, color: c.primaryHover },
  Transfer: { bg: c.purpleTint, color: c.purpleInk },
}

export const kindOf = (kind: string) => kindStyle[kind] ?? kindStyle.Stay

/** Card theming for packages and pricing plans. */
export type Accent = 'light' | 'crimson' | 'dark'

export interface AccentTheme {
  cardBg: string
  cardBorder: string
  cardShadow: string
  tagBg: string
  tagColor: string
  titleColor: string
  bodyColor: string
  subColor: string
  checkColor: string
  btnBg: string
  btnColor: string
  eyebrowColor: string
}

export function accentTheme(accent: Accent): AccentTheme {
  if (accent === 'crimson') {
    return {
      cardBg: c.primary,
      cardBorder: c.primary,
      cardShadow: '0 22px 48px -24px rgba(212,38,79,.5)',
      tagBg: c.yellow,
      tagColor: c.navy,
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,.88)',
      subColor: 'rgba(255,255,255,.75)',
      checkColor: c.yellow,
      btnBg: '#fff',
      btnColor: c.primary,
      eyebrowColor: 'rgba(255,255,255,.7)',
    }
  }
  if (accent === 'dark') {
    return {
      cardBg: c.navy,
      cardBorder: c.navy,
      cardShadow: '0 22px 48px -26px rgba(39,42,70,.5)',
      tagBg: 'rgba(255,255,255,.16)',
      tagColor: '#fff',
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,.82)',
      subColor: 'rgba(255,255,255,.6)',
      checkColor: c.yellow,
      btnBg: '#fff',
      btnColor: c.navy,
      eyebrowColor: c.yellow,
    }
  }
  return {
    cardBg: c.page,
    cardBorder: c.line,
    cardShadow: '0 14px 34px -24px rgba(39,42,70,.22)',
    tagBg: c.cyanTint,
    tagColor: c.cyanInk,
    titleColor: c.ink,
    bodyColor: c.body,
    subColor: c.textSubtle,
    checkColor: c.greenInk,
    btnBg: c.ink,
    btnColor: '#fff',
    eyebrowColor: c.primary,
  }
}

export const weatherStyle = (w: string) =>
  w === 'Dry' ? { bg: c.greenTint, color: c.greenInk } : { bg: c.amberTint, color: c.amberInk }
