import type { Currency } from './types'

/**
 * Prototype knobs. These were editor-exposed props on the Figma component;
 * here they are one place to tune the demo without hunting through JSX.
 */
export const config = {
  /** Max AI search results shown (1–6). */
  resultCount: 4,
  /** Fake latency before the AI overview appears, in ms. */
  thinkingDelay: 850,
  /** Free AI actions before the paywall interrupts. */
  trialGate: 3,
  /** Display currency. Catalogue prices are authored in USD. */
  currency: 'USD' as Currency,
  /** Characters revealed per tick while the AI overview types itself out. */
  streamCharsPerTick: 3,
  streamTickMs: 16,
  /** Taxes & service, applied to cart and planner subtotals. */
  serviceFeeRate: 0.06,
  /** Deposit share offered at checkout. */
  depositRate: 0.2,
  /** Private driver & transfers, per night. */
  transportPerNight: 65,
}
