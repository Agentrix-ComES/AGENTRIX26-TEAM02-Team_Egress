import type { Currency } from './types'

/** Catalogue prices are stored in USD; these are display-only conversions. */
const RATES: Record<Currency, { sym: string; rate: number }> = {
  USD: { sym: '$', rate: 1 },
  EUR: { sym: '€', rate: 0.92 },
  GBP: { sym: '£', rate: 0.78 },
}

export type MoneyFn = (n: number) => string

export function makeMoney(currency: Currency): MoneyFn {
  const { sym, rate } = RATES[currency] ?? RATES.USD
  return (n: number) => sym + Math.round(n * rate).toLocaleString()
}

/** Itinerary prices are authored as strings ("$210", "Free"). */
export function parsePrice(price: string | undefined): number {
  return parseInt((price ?? '0').replace(/[^\d]/g, ''), 10) || 0
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
