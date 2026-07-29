import type { Accent } from './theme'

export type Currency = 'USD' | 'EUR' | 'GBP'

export type ItemKind = 'Stay' | 'Activity' | 'Package' | 'Transfer'

/** Anything searchable by the AI panel. */
export interface InventoryItem {
  id: string
  kind: ItemKind
  slotId: string
  name: string
  place: string
  price: number
  unit: string
  tags: string[]
  note: string
}

/** An inventory item scored against a parsed query. */
export interface SearchResult extends InventoryItem {
  score: number
  reasons: string[]
  matchLabel: string
}

/** The four catalogue sections traditional search can filter to. */
export type TraditionalCategory = 'stays' | 'activities' | 'packages' | 'transport'

/** Search parameters for the plain keyword + category + date-range search. */
export interface TraditionalSearchParams {
  text: string
  category: TraditionalCategory | null
  startDate: string
  endDate: string
}

/** A Stay/Activity/Package/Transport item normalised to one shape for traditional search results. */
export interface CatalogueSearchItem {
  id: string
  kind: ItemKind
  category: TraditionalCategory
  slotId: string
  name: string
  subtitle: string
  price: number
  unitLabel: string
  badgeLabel: string
  badgeBg?: string
  badgeColor?: string
  aiNote: string
  placeholder: string
}

/** Structured intent pulled out of a free-text query. */
export interface ParsedQuery {
  interests: string[]
  kind?: ItemKind
  budget?: number
  nights?: number
  month?: string
  pax?: number
}

export interface CartItem {
  key: string
  id: string
  kind: ItemKind
  name: string
  meta: string
  price: number
  /** free cancellation */
  free: boolean
}

export type CartDraft = Omit<CartItem, 'key'>

export interface Stay {
  id: string
  slotId: string
  name: string
  place: string
  badge: string
  rating: string
  reviews: string
  price: number
  aiNote: string
  placeholder: string
}

export type ActivityCategory = 'Wildlife' | 'Culture' | 'Beach' | 'Food' | 'Hiking'

export interface Activity {
  id: string
  slotId: string
  name: string
  category: ActivityCategory
  detail: string
  price: number
  rating: string
  chipBg: string
  chipColor: string
  aiNote: string
  placeholder: string
}

export interface Package {
  id: string
  slotId: string
  tag: string
  duration: string
  name: string
  blurb: string
  price: number
  includes: string[]
  accent: Accent
  aiNote: string
  placeholder: string
}

export type TransportMode =
  | 'Private driver'
  | 'Train'
  | 'Tuk-tuk'
  | 'Domestic flight'
  | 'Coach'
  | 'Seaplane'

export interface Transport {
  id: string
  slotId: string
  name: string
  mode: TransportMode
  route: string
  detail: string
  price: number
  unit: string
  rating: string
  aiNote: string
  placeholder: string
}

export interface ItineraryItem {
  tag: 'STAY' | 'DO'
  text: string
  price: string
}

export interface ItineraryDay {
  place: string
  nights: number
  drive: string
  weather: string
  items: ItineraryItem[]
}

export type Pace = 'relaxed' | 'balanced' | 'packed'

export interface AgentJob {
  icon: string
  title: string
  note: string
  cadence: string
  bg: string
  color: string
}

export type ChannelName = 'Email' | 'WhatsApp' | 'SMS' | 'Push'

export interface FeedAlert {
  id: string
  time: string
  icon: string
  title: string
  source: string
  channel: ChannelName
  body: string
  acceptLabel: string
  iconBg: string
  iconColor: string
  resolvedLabel: string
  /** What the AI says in the assistant panel when the traveller keeps this item as planned. */
  dismissReply: string
}

export interface Plan {
  id: string
  eyebrow: string
  name: string
  price: number
  unit: string
  blurb: string
  features: string[]
  cta: string
  accent: Accent
  badge?: boolean
}

export interface VoiceTurn {
  short: string
  q: string
  a: string
}

export interface Faq {
  q: string
  a: string
}
