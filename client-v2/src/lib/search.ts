import { INVENTORY } from '@/data/catalogue'
import type { InventoryItem, ParsedQuery, SearchResult } from './types'

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

/** Months when the south/west coasts are wet and the east coast is dry. */
const WET_SOUTH_MONTHS = ['May', 'June', 'July', 'August', 'September']

const INTEREST_PATTERNS: Array<[RegExp, string]> = [
  [/beach|surf|coast|sea|swim/, 'beach'],
  [/tea|hill|ella|nuwara|train/, 'tea'],
  [/safari|leopard|elephant|wildlife|whale/, 'wildlife'],
  [/culture|temple|sigiriya|kandy|heritage|fort/, 'culture'],
  [/kid|family|children/, 'family'],
  [/honeymoon|couple|romantic/, 'couple'],
  [/solo|alone|by myself/, 'solo'],
  [/cheap|budget|affordable/, 'budget'],
]

/**
 * Pulls structured intent out of a free-text query.
 *
 * Deliberately a regex pass, not a model call — the real planner agent will
 * replace this, but the UI needs something deterministic to demo against.
 */
export function parseQuery(query: string): ParsedQuery {
  const s = query.toLowerCase()
  const parsed: ParsedQuery = { interests: [] }

  for (const [pattern, interest] of INTEREST_PATTERNS) {
    if (pattern.test(s)) parsed.interests.push(interest)
  }

  if (/hotel|stay|villa|room/.test(s)) parsed.kind = 'Stay'
  else if (/activit|tour|thing to do|excursion|safari|lesson/.test(s)) parsed.kind = 'Activity'
  else if (/package|itinerar|whole trip|all inclusive/.test(s)) parsed.kind = 'Package'

  const budget =
    s.match(/(?:under|below|max|less than|budget of|around)\s*\$?\s*([\d,]{3,6})/) ??
    s.match(/\$\s*([\d,]{3,6})/)
  if (budget) parsed.budget = parseInt(budget[1].replace(/,/g, ''), 10)

  const nights = s.match(/(\d{1,2})\s*(nights?|days?|weeks?)/)
  if (nights) {
    const n = parseInt(nights[1], 10)
    parsed.nights = /week/.test(nights[2]) ? n * 7 : n
  }

  const month = MONTHS.find((m) => s.includes(m.slice(0, 3)))
  if (month) parsed.month = month.charAt(0).toUpperCase() + month.slice(1)

  const pax = s.match(/(\d{1,2})\s*(people|adults|travellers|travelers|of us|pax)/)
  if (pax) parsed.pax = parseInt(pax[1], 10)

  return parsed
}

function scoreItem(item: InventoryItem, q: ParsedQuery) {
  let score = 1
  const reasons: string[] = []

  if (q.kind) score += item.kind === q.kind ? 3 : -2

  const overlap = q.interests.filter((i) => item.tags.includes(i))
  if (overlap.length) {
    score += overlap.length * 1.6
    reasons.push(`Matches ${overlap.slice(0, 2).join(' + ')}`)
  }

  if (q.budget) {
    const perTrip = item.kind === 'Stay' ? item.price * (q.nights || 7) : item.price
    if (perTrip <= q.budget) {
      score += 2
      reasons.push(`Fits a $${q.budget.toLocaleString()} budget`)
    } else {
      score -= 2.5
    }
  }

  if (q.month) {
    const isEast = item.place.toLowerCase().includes('east')
    const southIsWet = WET_SOUTH_MONTHS.includes(q.month)
    if (isEast === southIsWet) {
      score += 1.2
      reasons.push(`${q.month} is the dry window here`)
    } else {
      score -= 1
      reasons.push(`${q.month} can be wet on this coast`)
    }
  }

  if (q.nights && item.kind === 'Package') {
    score += 1
    reasons.push(`Reshapes to ${q.nights} nights`)
  }

  if (q.pax && q.pax >= 4) reasons.push('Family rooms available')

  if (reasons.length < 2) reasons.push(item.note.charAt(0).toUpperCase() + item.note.slice(1))

  return { score, reasons: reasons.slice(0, 3) }
}

export function runSearch(query: string, limit: number) {
  const parsed = parseQuery(query)

  const scored = INVENTORY.map((item) => ({ ...item, ...scoreItem(item, parsed) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const top = scored.slice(0, Math.max(1, Math.min(6, limit)))
  const best = top.length ? top[0].score : 1

  const results: SearchResult[] = top.map((r) => ({
    ...r,
    matchLabel: `${Math.round((r.score / best) * 100)}% match`,
  }))

  return { results, criteria: buildCriteria(parsed), answer: buildAnswer(parsed, results) }
}

function buildCriteria(q: ParsedQuery): string[] {
  const criteria: string[] = []
  if (q.kind) criteria.push(`${q.kind}s`)
  if (q.nights) criteria.push(`${q.nights} nights`)
  if (q.month) criteria.push(q.month)
  if (q.pax) criteria.push(`${q.pax} travellers`)
  if (q.budget) criteria.push(`Under $${q.budget.toLocaleString()}`)
  q.interests.forEach((i) => criteria.push(i.charAt(0).toUpperCase() + i.slice(1)))
  return criteria.length ? criteria : ['Open dates']
}

function buildAnswer(q: ParsedQuery, results: SearchResult[]): string {
  if (!results.length) return ''
  const top = results[0]
  const coast = q.month && WET_SOUTH_MONTHS.includes(q.month) ? 'east coast' : 'south and west coasts'

  const tail =
    q.interests.length > 1
      ? `Because you want ${q.interests
          .slice(0, 2)
          .join(' and ')}, the planner below sequences both into one loop with no drive over four hours.`
      : 'Add anything here straight to the cart, or open the planner to turn it into a day-by-day trip.'

  return (
    `For ${q.nights ? `${q.nights} nights` : 'this trip'}${q.month ? ` in ${q.month}` : ''}` +
    ` I'd stay on the ${coast} — that's the dry side then. ${top.name} is the strongest single match: ` +
    `${top.note}, from $${top.price.toLocaleString()} ${top.unit}. ${tail}`
  )
}
