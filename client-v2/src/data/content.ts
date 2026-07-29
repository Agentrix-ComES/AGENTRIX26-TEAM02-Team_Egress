import type { AgentJob, ChannelName, Faq, FeedAlert, Plan, VoiceTurn } from '@/lib/types'

/** Named background jobs the live companion runs. */
export const AGENT_JOBS: AgentJob[] = [
  {
    icon: 'LightMode',
    title: 'Weather watch',
    note: "Reads the 48-hour forecast for the exact spot you're heading to, not the nearest city, and flags rain over 60% before an outdoor booking.",
    cadence: 'Every 3 hours',
    bg: 'rgba(241,202,1,.14)',
    color: '#f1ca01',
  },
  {
    icon: 'Shield',
    title: 'Safety & news scan',
    note: 'Monitors official advisories, strikes, road closures and local news for every stop on your route.',
    cadence: 'Every 30 minutes',
    bg: 'rgba(0,197,128,.14)',
    color: '#00c580',
  },
  {
    icon: 'AutoMode',
    title: 'Plan re-sequencing',
    note: 'When a day breaks, it rebuilds the affected days only — keeping your bookings, budget and drive-time limits.',
    cadence: 'On any disruption',
    bg: 'rgba(212,38,79,.16)',
    color: '#ec8299',
  },
  {
    icon: 'Diversity',
    title: 'Booking guard',
    note: "Re-confirms each hotel and tour 24 hours ahead and chases the supplier itself if there's no reply.",
    cadence: '24h before each item',
    bg: 'rgba(1,161,210,.16)',
    color: '#01a1d2',
  },
  {
    icon: 'Mood',
    title: 'Enquiry handling',
    note: 'Answers your questions on any channel, holds or cancels within policy, and hands to a human within 60 seconds when you ask.',
    cadence: '24/7',
    bg: 'rgba(127,125,223,.18)',
    color: '#a9a7ef',
  },
]

/** Live disruption feed shown in the companion section. */
export const FEED: FeedAlert[] = [
  {
    id: 'f1',
    time: '06:10',
    mark: '!',
    title: 'Heavy rain at Sigiriya tomorrow, 07:00',
    source: 'Weather',
    channel: 'WhatsApp',
    body: '82% rain probability at sunrise, clearing by 11:00. I can move your rock climb to the afternoon slot and keep the same guide — the entrance ticket transfers free.',
    acceptLabel: 'Move to 14:30',
    iconBg: 'rgba(241,202,1,.16)',
    iconColor: '#f1ca01',
    resolvedLabel: 'Moved to 14:30 · guide and ticket updated',
  },
  {
    id: 'f2',
    time: '09:42',
    mark: 'i',
    title: 'Road works on the A9 toward Kandy',
    source: 'News',
    channel: 'Email',
    body: 'Local reports say the Matale bypass is single-lane until Thursday, adding about 50 minutes. Leaving at 08:00 instead of 09:30 keeps you ahead of the school traffic.',
    acceptLabel: 'Shift pickup to 08:00',
    iconBg: 'rgba(1,161,210,.16)',
    iconColor: '#01a1d2',
    resolvedLabel: 'Driver notified · pickup now 08:00',
  },
  {
    id: 'f3',
    time: '13:05',
    mark: '✓',
    title: "Tomorrow's safari is re-confirmed",
    source: 'Booking',
    channel: 'Push',
    body: "Wild Coast Tented Lodge confirmed your 05:15 jeep and packed breakfast. Nothing needed from you — I'll send the driver's number tonight.",
    acceptLabel: 'Add driver to contacts',
    iconBg: 'rgba(0,197,128,.16)',
    iconColor: '#00c580',
    resolvedLabel: 'Driver saved to your contacts',
  },
  {
    id: 'f4',
    time: '17:20',
    mark: '!',
    title: 'Sea swell advisory, Mirissa',
    source: 'Safety',
    channel: 'SMS',
    body: 'The port authority raised a small-craft advisory for Friday morning, which affects your whale-watching boat. Operator offers Saturday at the same time, or a full refund.',
    acceptLabel: 'Rebook Saturday',
    iconBg: 'rgba(212,38,79,.18)',
    iconColor: '#ec8299',
    resolvedLabel: 'Rebooked Saturday 06:30 · confirmation sent',
  },
]

export const CHANNEL_NAMES: ChannelName[] = ['Email', 'WhatsApp', 'SMS', 'Push']

export const CHANNEL_DETAIL: Record<ChannelName, string> = {
  Email: 'ida@example.com · full daily briefing at 20:00',
  WhatsApp: '+94 77 000 0000 · works on hotel wifi, no roaming',
  SMS: 'Fallback when you have no data at all',
  Push: 'In-app, silent during quiet hours',
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    eyebrow: 'Starter',
    name: 'Free Planner',
    price: 0,
    unit: 'forever',
    blurb: 'Plan unlimited trips with the AI planner and book them. No card needed.',
    features: [
      'Unlimited AI itineraries',
      'Full search and review summaries',
      'Route optimisation and re-pacing',
      'Add plans to cart and book',
      'Email support',
    ],
    cta: 'Start Free',
    accent: 'light',
  },
  {
    id: 'companion',
    eyebrow: 'Traveller',
    name: 'Live Companion',
    price: 8.99,
    unit: 'per month',
    blurb: 'Everything in Free Planner, plus a live companion that watches your trip and reacts.',
    features: [
      'Everything in Free Planner',
      'Live trip companion on every trip',
      'Weather, news and safety monitoring',
      'Auto re-sequencing and rebooking',
      'WhatsApp, email, SMS and push alerts',
      'Priority human handoff',
    ],
    cta: 'Choose Live Companion',
    accent: 'crimson',
    badge: true,
  },
  {
    id: 'voice',
    eyebrow: 'Unlimited',
    name: 'Voice & Custom',
    price: 18.99,
    unit: 'per month',
    blurb: 'Everything in Live Companion, plus a hands-free voice guide for the whole trip.',
    features: [
      'Everything in Live Companion',
      'Voice guide, hands-free, 6 languages',
      'Custom agent rules and preferences',
      'Group trips with split billing',
      'Offline day briefings',
      'Named specialist on call',
    ],
    cta: 'Choose Voice & Custom',
    accent: 'dark',
  },
]

/** Canned turns the voice guide cycles through. */
export const VOICE_SCRIPT: VoiceTurn[] = [
  {
    short: 'Where am I?',
    q: 'Tell me about where I am right now',
    a: "You're standing at the western edge of Galle Fort, on ramparts the Dutch finished in 1729 on top of an earlier Portuguese wall. If you walk south for eight minutes you'll reach the lighthouse — and at this hour the light is on the mosque behind it, which is the photograph everyone actually wants.",
  },
  {
    short: 'Next two hours?',
    q: 'What should I do with the next two hours?',
    a: "Two hours is exactly a slow loop. Walk the ramparts to the lighthouse, drop into Pedlar's Street for a lime soda, then be back on the western wall by 18:20 — sunset is 18:34 today and the wall fills up ten minutes before that. I've held your food walk at 19:30, so there's no rush.",
  },
  {
    short: 'Closed tomorrow?',
    q: 'Is anything closed tomorrow?',
    a: "Tomorrow is a poya full-moon day, so alcohol isn't served anywhere and the museum shuts at noon. Your temple visit is fine and actually better — expect drumming from about 17:00. I've already moved your dinner reservation to a hotel restaurant, which is exempt.",
  },
  {
    short: 'I feel unwell',
    q: 'I feel unwell — what are my options?',
    a: 'The nearest good clinic is Ruhunu Hospital, eleven minutes by tuk-tuk, English-speaking and open now. I can call a driver, send the address to your phone in Sinhala for him, and move tomorrow’s safari back a day at no cost. Say the word and I’ll do all three.',
  },
]

export const FAQS: Faq[] = [
  {
    q: 'Can I book without using any AI features?',
    a: 'Yes. Stays, activities, packages and transfers all work as a normal booking site — search, add to cart, pay. The AI planner, live companion and voice guide are optional extras on top.',
  },
  {
    q: 'What happens when my 7-day trial ends?',
    a: 'Nothing is charged automatically unless you pick a plan. Anything you already booked stays booked, and any trip already in progress keeps its live companion until you get home.',
  },
  {
    q: 'How does the live companion reach me?',
    a: 'Email, WhatsApp, SMS or push — you choose per channel, and safety alerts always go out on all of them. WhatsApp is the default because it works on hotel wifi without roaming data.',
  },
  {
    q: 'Will the agent change my bookings without asking?',
    a: 'No. It proposes, you approve — every alert has an accept and a keep-as-planned button. The one exception is a re-confirmation, which needs no decision from you.',
  },
  {
    q: 'Is a human involved at all?',
    a: 'Always. A Sri Lanka–based specialist reviews every itinerary before payment, and you can hand any conversation to a person within about sixty seconds, day or night.',
  },
]

export const SEARCH_CHIPS = [
  '10 days in February, beaches and tea country, 2 people under $2,500',
  'Family of 4 in July — where is it dry?',
  'Best hotels near Yala for a dawn safari',
  'One week, surf and slow, travelling solo',
]

export const FOLLOW_UPS = [
  'How many hours of driving is this in total?',
  'Can I swap Yala for Udawalawe?',
  'What will this cost with domestic flights instead?',
  'Is February too busy on the south coast?',
]
