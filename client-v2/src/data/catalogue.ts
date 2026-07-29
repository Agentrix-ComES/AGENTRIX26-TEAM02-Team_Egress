import { c } from '@/lib/theme'
import type {
  Activity,
  InventoryItem,
  ItineraryDay,
  Package,
  Stay,
} from '@/lib/types'

/**
 * Mock catalogue, lifted from the Figma prototype.
 *
 * This is the seam where the real backend plugs in — swap these constants for
 * calls to the gateway and nothing else in the UI has to change.
 */

/** The pool the AI search panel scores against. */
export const INVENTORY: InventoryItem[] = [
  {
    id: 'h1',
    kind: 'Stay',
    slotId: 'v4-r-h1',
    name: 'Cape Weligama',
    place: 'Weligama · south coast',
    price: 320,
    unit: 'per night',
    tags: ['beach', 'luxury', 'couple'],
    note: 'clifftop villas over the surf, adults-mostly',
  },
  {
    id: 'h2',
    kind: 'Stay',
    slotId: 'v4-r-h2',
    name: 'Heritance Tea Factory',
    place: 'Nuwara Eliya · hill country',
    price: 180,
    unit: 'per night',
    tags: ['tea', 'hills', 'culture'],
    note: 'a working tea factory turned hotel at 2,000m',
  },
  {
    id: 'a1',
    kind: 'Activity',
    slotId: 'v4-r-a1',
    name: 'Yala leopard safari, dawn',
    place: 'Yala · south east',
    price: 95,
    unit: 'per person',
    tags: ['wildlife', 'family', 'safari'],
    note: 'private jeep, 5:30am gate entry, best leopard odds',
  },
  {
    id: 'a2',
    kind: 'Activity',
    slotId: 'v4-r-a2',
    name: 'Ella train + Nine Arch walk',
    place: 'Ella · hill country',
    price: 42,
    unit: 'per person',
    tags: ['train', 'hills', 'budget', 'culture'],
    note: 'reserved window seats on the Kandy–Ella line',
  },
  {
    id: 'p1',
    kind: 'Package',
    slotId: 'v4-r-p1',
    name: 'Classic Sri Lanka, 10 nights',
    place: 'Coast · culture · tea',
    price: 1690,
    unit: 'per person',
    tags: ['beach', 'culture', 'tea', 'family', 'couple'],
    note: 'five regions, private driver, all transfers',
  },
  {
    id: 'p2',
    kind: 'Package',
    slotId: 'v4-r-p2',
    name: 'Surf & Slow South, 7 nights',
    place: 'Weligama → Hiriketiya',
    price: 1140,
    unit: 'per person',
    tags: ['beach', 'surf', 'budget', 'solo'],
    note: 'two beach bases, coached surf, no long drives',
  },
]

export const STAYS: Stay[] = [
  {
    id: 's1',
    slotId: 'v4-stay1',
    name: 'Cape Weligama',
    place: 'Weligama, south coast',
    badge: 'Clifftop',
    rating: '9.4',
    reviews: '1,208 reviews',
    price: 320,
    aiNote:
      'Guests love the ocean pools and calm; a few note the walk down to the beach is steep.',
    placeholder: 'Clifftop resort pool',
  },
  {
    id: 's2',
    slotId: 'v4-stay2',
    name: 'Heritance Tea Factory',
    place: 'Nuwara Eliya, hill country',
    badge: 'Heritage',
    rating: '9.0',
    reviews: '864 reviews',
    price: 180,
    aiNote:
      'Cold nights and misty views are the highlight — bring layers, rooms have no A/C by design.',
    placeholder: 'Tea factory hotel in mist',
  },
  {
    id: 's3',
    slotId: 'v4-stay3',
    name: 'Wallawwa Villa',
    place: 'Negombo, near airport',
    badge: 'First night',
    rating: '9.2',
    reviews: '2,041 reviews',
    price: 210,
    aiNote:
      'Most-booked arrival stay: 25 minutes from the airport, garden rooms, late check-in is routine.',
    placeholder: 'Colonial garden villa',
  },
  {
    id: 's4',
    slotId: 'v4-stay4',
    name: 'Palm Grove Cabanas',
    place: 'Arugam Bay, east coast',
    badge: 'May–Sep',
    rating: '8.7',
    reviews: '532 reviews',
    price: 74,
    aiNote:
      'Simple, spotless cabanas a minute from the point; reviewers mention early-morning surf noise.',
    placeholder: 'Beach cabana under palms',
  },
]

export const ACTIVITY_FILTERS = ['All', 'Wildlife', 'Culture', 'Beach', 'Food', 'Hiking'] as const

export const ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    slotId: 'v4-act1',
    name: 'Yala leopard safari',
    category: 'Wildlife',
    detail: 'Private jeep · 5 hrs · dawn',
    price: 95,
    rating: '4.9',
    chipBg: c.greenTint,
    chipColor: c.greenInk,
    placeholder: 'Leopard in Yala',
  },
  {
    id: 'a2',
    slotId: 'v4-act2',
    name: 'Kandy → Ella scenic train',
    category: 'Culture',
    detail: 'Reserved seats · 6.5 hrs',
    price: 42,
    rating: '4.8',
    chipBg: c.cyanTint,
    chipColor: c.cyanInk,
    placeholder: 'Train through tea fields',
  },
  {
    id: 'a3',
    slotId: 'v4-act3',
    name: 'Sigiriya at sunrise',
    category: 'Culture',
    detail: 'Skip-the-line · guide · 4 hrs',
    price: 58,
    rating: '4.7',
    chipBg: c.cyanTint,
    chipColor: c.cyanInk,
    placeholder: 'Sigiriya rock at dawn',
  },
  {
    id: 'a4',
    slotId: 'v4-act4',
    name: 'Beginner surf lesson',
    category: 'Beach',
    detail: 'Weligama · 2 hrs · board incl.',
    price: 28,
    rating: '4.9',
    chipBg: c.amberTint,
    chipColor: c.amberInk,
    placeholder: 'Surf lesson in the shallows',
  },
  {
    id: 'a5',
    slotId: 'v4-act5',
    name: 'Whale watching, Mirissa',
    category: 'Wildlife',
    detail: 'Small boat · 4 hrs · Nov–Apr',
    price: 62,
    rating: '4.6',
    chipBg: c.greenTint,
    chipColor: c.greenInk,
    placeholder: 'Blue whale off Mirissa',
  },
  {
    id: 'a6',
    slotId: 'v4-act6',
    name: 'Galle Fort food walk',
    category: 'Food',
    detail: 'Evening · 8 tastings · 3 hrs',
    price: 45,
    rating: '4.9',
    chipBg: c.primaryTint,
    chipColor: c.primaryHover,
    placeholder: 'Street food in Galle Fort',
  },
  {
    id: 'a7',
    slotId: 'v4-act7',
    name: 'Knuckles trek + waterfall',
    category: 'Hiking',
    detail: 'Guided · 7 hrs · moderate',
    price: 70,
    rating: '4.8',
    chipBg: c.muted,
    chipColor: c.body,
    placeholder: 'Knuckles range trail',
  },
]

export const PACKAGES: Package[] = [
  {
    id: 'pk1',
    slotId: 'v4-pkg1',
    tag: 'Bestseller',
    duration: '10 nights',
    name: 'Classic Sri Lanka',
    blurb:
      'The full loop — culture triangle, tea country, safari and four nights on the south coast.',
    price: 1690,
    includes: [
      '9 hotels, breakfast daily',
      'Private driver-guide throughout',
      'Sigiriya, Yala and Ella included',
      'Airport transfers both ways',
    ],
    accent: 'light',
    placeholder: 'Culture triangle at sunrise',
  },
  {
    id: 'pk2',
    slotId: 'v4-pkg2',
    tag: 'Most flexible',
    duration: '7 nights',
    name: 'Surf & Slow South',
    blurb:
      'Two beach bases, coached surf every morning, nothing more than 40 minutes apart.',
    price: 1140,
    includes: [
      '2 boutique beach stays',
      '10 coached surf sessions',
      'Galle Fort food walk',
      'All ground transfers',
    ],
    accent: 'crimson',
    placeholder: 'South coast beach break',
  },
  {
    id: 'pk3',
    slotId: 'v4-pkg3',
    tag: 'Family',
    duration: '12 nights',
    name: 'Wild Family Sri Lanka',
    blurb:
      'Elephants, trains, turtles and a pool at the end of every day — paced for kids.',
    price: 1980,
    includes: [
      'Family rooms throughout',
      'Two safaris, one turtle hatchery',
      'Scenic train in reserved class',
      'Car seats and a flexible schedule',
    ],
    accent: 'light',
    placeholder: 'Elephants at Minneriya',
  },
]

/** The AI planner's starting itinerary. */
export const BASE_ITINERARY: ItineraryDay[] = [
  {
    place: 'Negombo',
    nights: 1,
    drive: '25 min',
    weather: 'Dry',
    items: [
      { tag: 'STAY', text: 'Wallawwa Villa — garden room', price: '$210' },
      { tag: 'DO', text: 'Late arrival, fish market at dawn if awake', price: 'Free' },
    ],
  },
  {
    place: 'Sigiriya',
    nights: 2,
    drive: '3h 40m',
    weather: 'Dry',
    items: [
      { tag: 'STAY', text: 'Water Garden Sigiriya — pool villa', price: '$260' },
      { tag: 'DO', text: 'Sigiriya rock at sunrise, skip-the-line', price: '$58' },
      { tag: 'DO', text: 'Minneriya elephant gathering, afternoon', price: '$66' },
    ],
  },
  {
    place: 'Kandy → Ella',
    nights: 2,
    drive: '2h + train',
    weather: 'Showers',
    items: [
      { tag: 'STAY', text: '98 Acres Resort — tea-field cabin', price: '$190' },
      { tag: 'DO', text: 'Kandy–Ella train, reserved window seats', price: '$42' },
      { tag: 'DO', text: 'Nine Arch Bridge walk, early', price: 'Free' },
    ],
  },
  {
    place: 'Yala',
    nights: 2,
    drive: '2h 30m',
    weather: 'Dry',
    items: [
      { tag: 'STAY', text: 'Wild Coast Tented Lodge', price: '$390' },
      { tag: 'DO', text: 'Dawn leopard safari, private jeep', price: '$95' },
    ],
  },
  {
    place: 'Weligama',
    nights: 3,
    drive: '2h 15m',
    weather: 'Dry',
    items: [
      { tag: 'STAY', text: 'Cape Weligama — cliff villa', price: '$320' },
      { tag: 'DO', text: 'Beginner surf lesson', price: '$28' },
      { tag: 'DO', text: 'Galle Fort food walk, evening', price: '$45' },
    ],
  },
]

/** Appended by "Add a day" / "Swap this day". */
export const EXTRA_DAY: ItineraryDay = {
  place: 'Mirissa',
  nights: 1,
  drive: '20 min',
  weather: 'Dry',
  items: [
    { tag: 'STAY', text: 'Mirissa Hills — garden suite', price: '$165' },
    { tag: 'DO', text: 'Whale watching, small boat', price: '$62' },
  ],
}

export const MONTH_OPTIONS = [
  'December',
  'January',
  'February',
  'March',
  'April',
  'May',
  'July',
  'August',
]

export const PLANNER_CHECKS = [
  {
    mark: '✓',
    bg: c.greenTint,
    color: c.greenInk,
    title: 'Dry-season fit',
    note: 'All coastal nights fall in the south-coast dry window.',
  },
  {
    mark: '✓',
    bg: c.greenTint,
    color: c.greenInk,
    title: 'Drive times',
    note: 'Longest single transfer is 3h 40m, with a lunch stop built in.',
  },
  {
    mark: '!',
    bg: c.amberTint,
    color: c.amberInk,
    title: 'One tight morning',
    note: 'Sigiriya sunrise means a 5:00am start — the planner blocked the evening before.',
  },
  {
    mark: '✓',
    bg: c.greenTint,
    color: c.greenInk,
    title: 'Cancellation',
    note: 'Every stay in this plan is free-cancellation up to 48 hours out.',
  },
]
