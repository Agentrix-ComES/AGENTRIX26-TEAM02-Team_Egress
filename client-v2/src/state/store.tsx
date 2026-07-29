import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { BASE_ITINERARY, EXTRA_DAY } from '@/data/catalogue'
import { CHANNEL_NAMES, PLANS, VOICE_SCRIPT } from '@/data/content'
import type { SearchTabId } from '@/data/content'
import { config } from '@/lib/config'
import { makeMoney, parsePrice } from '@/lib/money'
import { runSearch } from '@/lib/search'
import type {
  CartDraft,
  CartItem,
  ChannelName,
  ItineraryDay,
  Pace,
  SearchResult,
  VoiceTurn,
} from '@/lib/types'

export type SearchStatus = 'idle' | 'thinking' | 'done' | 'empty'

export interface PlannerDay extends ItineraryDay {
  /** Index into BASE_ITINERARY, or -1 for the appended extra day. */
  originalIndex: number
}

/**
 * Single app store.
 *
 * The prototype is one page with a lot of cross-talk (search feeds the
 * planner, the planner feeds the cart, every AI action can trip the paywall),
 * so one provider is simpler to follow than several. If this grows past a
 * screen or two of state, split by feature rather than adding a library.
 */
function useAppStore() {
  const money = useMemo(() => makeMoney(config.currency), [])

  // --- search ------------------------------------------------------------
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<SearchTabId>('ask')
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<SearchResult[]>([])
  const [criteria, setCriteria] = useState<string[]>([])
  const [answer, setAnswer] = useState('')
  const [typed, setTyped] = useState(0)

  // structured search form (non-"Ask AI" tabs)
  const [where, setWhere] = useState('')
  const [month, setMonth] = useState('February')
  const [nights, setNights] = useState('10')
  const [pax, setPax] = useState('2')

  // --- monetisation ------------------------------------------------------
  const [aiUses, setAiUses] = useState(0)
  const [chosenPlan, setChosenPlan] = useState<string | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)

  // --- cart --------------------------------------------------------------
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  // --- planner -----------------------------------------------------------
  const [pace, setPace] = useState<Pace>('balanced')
  const [removedDays, setRemovedDays] = useState<number[]>([])
  const [extraDay, setExtraDay] = useState(false)
  const [optimised, setOptimised] = useState(false)

  // --- companion ---------------------------------------------------------
  const [companionOn, setCompanionOn] = useState(false)
  const [resolved, setResolved] = useState<string[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [channels, setChannels] = useState<Record<ChannelName, boolean>>({
    Email: true,
    WhatsApp: true,
    SMS: false,
    Push: true,
  })

  // --- voice -------------------------------------------------------------
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceTurns, setVoiceTurns] = useState<VoiceTurn[]>([])

  // --- misc UI -----------------------------------------------------------
  const [openFaq, setOpenFaq] = useState(0)
  const [activityFilter, setActivityFilter] = useState('All')

  const searchTimer = useRef<number | undefined>(undefined)
  const listenTimer = useRef<number | undefined>(undefined)

  /**
   * Gate for anything the AI does. Counts the use, opens the paywall once the
   * trial allowance is spent, and only then runs the action.
   */
  const useAiFeature = useCallback(
    (run?: () => void) => {
      const uses = aiUses + 1
      setAiUses(uses)
      if (!chosenPlan && uses > config.trialGate) {
        setPaywallOpen(true)
        return false
      }
      run?.()
      return true
    },
    [aiUses, chosenPlan],
  )

  // --- search actions ----------------------------------------------------

  const search = useCallback((text: string) => {
    const q = text.trim()
    if (!q) return

    window.clearTimeout(searchTimer.current)
    setStatus('thinking')
    setTyped(0)

    searchTimer.current = window.setTimeout(() => {
      const outcome = runSearch(q, config.resultCount)
      setResults(outcome.results)
      setCriteria(outcome.criteria)
      setAnswer(outcome.answer)
      setStatus(outcome.results.length ? 'done' : 'empty')
    }, Math.max(0, config.thinkingDelay))
  }, [])

  const submitQuery = useCallback(
    () => useAiFeature(() => search(query)),
    [search, query, useAiFeature],
  )

  /** Chips and follow-up questions: fill the box, switch to Ask, run it. */
  const askSuggestion = useCallback(
    (text: string) => {
      setQuery(text)
      setTab('ask')
      useAiFeature(() => search(text))
    },
    [search, useAiFeature],
  )

  const submitForm = useCallback(() => {
    const kind = tab === 'ask' ? '' : `${tab} `
    search(`${kind}${where || 'Sri Lanka'}, ${nights} nights in ${month}, ${pax} travellers`)
  }, [tab, where, nights, month, pax, search])

  // Type the AI overview out one chunk at a time.
  useEffect(() => {
    if (!answer) return
    const id = window.setInterval(() => {
      setTyped((t) => {
        if (t >= answer.length) {
          window.clearInterval(id)
          return answer.length
        }
        return Math.min(answer.length, t + config.streamCharsPerTick)
      })
    }, config.streamTickMs)
    return () => window.clearInterval(id)
  }, [answer])

  useEffect(
    () => () => {
      window.clearTimeout(searchTimer.current)
      window.clearTimeout(listenTimer.current)
    },
    [],
  )

  // --- cart actions ------------------------------------------------------

  const addToCart = useCallback((draft: CartDraft) => {
    setCart((prev) =>
      prev.concat({
        ...draft,
        key: `${draft.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      }),
    )
    setCartOpen(true)
  }, [])

  const addManyToCart = useCallback((drafts: CartDraft[]) => {
    const stamp = Date.now()
    setCart((prev) => prev.concat(drafts.map((d, n) => ({ ...d, key: `${d.id}-${stamp}-${n}` }))))
    setCartOpen(true)
  }, [])

  const removeFromCart = useCallback(
    (key: string) => setCart((prev) => prev.filter((item) => item.key !== key)),
    [],
  )

  // --- planner -----------------------------------------------------------

  /** BASE_ITINERARY after removals, the extra day, pace and re-optimisation. */
  const plannerDays = useMemo<PlannerDay[]>(() => {
    let days: PlannerDay[] = BASE_ITINERARY.map((d, i) => ({ ...d, originalIndex: i })).filter(
      (d) => !removedDays.includes(d.originalIndex),
    )

    if (extraDay) days = days.concat({ ...EXTRA_DAY, originalIndex: -1 })

    if (pace === 'relaxed') days = days.map((d) => ({ ...d, nights: d.nights + 1 }))
    if (pace === 'packed') {
      days = days.map((d) => ({ ...d, nights: Math.max(1, d.nights - (d.nights > 1 ? 1 : 0)) }))
    }

    // Shortest transfers first — a stand-in for the real route optimiser.
    if (optimised) days = [...days].sort((a, b) => a.drive.length - b.drive.length)

    return days
  }, [removedDays, extraDay, pace, optimised])

  const removeDay = useCallback((originalIndex: number) => {
    if (originalIndex < 0) {
      setExtraDay(false)
      return
    }
    setRemovedDays((prev) => prev.concat(originalIndex))
  }, [])

  /** Swap = drop this stop and offer the alternative one. */
  const swapDay = useCallback(
    (originalIndex: number) => {
      removeDay(originalIndex)
      setExtraDay(true)
    },
    [removeDay],
  )

  const travellers = parseInt(pax, 10) || 2

  const plannerTotals = useMemo(() => {
    const nightTotal = plannerDays.reduce((n, d) => n + d.nights, 0)

    const stayCost = plannerDays.reduce((sum, d) => {
      const stay = d.items.find((i) => i.tag === 'STAY')
      return sum + parsePrice(stay?.price) * d.nights
    }, 0)

    const activityCost = plannerDays.reduce(
      (sum, d) =>
        sum + d.items.filter((i) => i.tag === 'DO').reduce((a, i) => a + parsePrice(i.price), 0),
      0,
    )

    const transport = nightTotal * config.transportPerNight
    const subtotal = stayCost + activityCost * travellers + transport
    const fees = Math.round(subtotal * config.serviceFeeRate)

    return {
      nightTotal,
      stayCost,
      activityCost,
      transport,
      fees,
      total: subtotal + fees,
    }
  }, [plannerDays, travellers])

  /** Adds every priced line in the plan as its own cancellable cart item. */
  const addPlanToCart = useCallback(() => {
    const drafts: CartDraft[] = []

    for (const day of plannerDays) {
      for (const item of day.items) {
        const value = parsePrice(item.price)
        if (!value) continue
        const isStay = item.tag === 'STAY'
        drafts.push({
          id: `plan-${day.place}-${item.text.slice(0, 8)}`,
          kind: isStay ? 'Stay' : 'Activity',
          name: item.text,
          meta: `${day.place} · ${
            isStay
              ? `${day.nights} night${day.nights === 1 ? '' : 's'}`
              : `${travellers} traveller${travellers === 1 ? '' : 's'}`
          }`,
          price: isStay ? value * day.nights : value * travellers,
          free: true,
        })
      }
    }

    drafts.push({
      id: 'plan-transport',
      kind: 'Transfer',
      name: 'Private driver & all transfers',
      meta: `${plannerTotals.nightTotal} nights, air-con van`,
      price: plannerTotals.transport,
      free: false,
    })

    addManyToCart(drafts)
  }, [plannerDays, plannerTotals, travellers, addManyToCart])

  // --- companion ---------------------------------------------------------

  const activateCompanion = useCallback(
    () => useAiFeature(() => setCompanionOn(true)),
    [useAiFeature],
  )

  const acceptAlert = useCallback(
    (id: string) => setResolved((prev) => (prev.includes(id) ? prev : prev.concat(id))),
    [],
  )

  const dismissAlert = useCallback((id: string) => setDismissed((prev) => prev.concat(id)), [])

  const toggleChannel = useCallback(
    (name: ChannelName) => setChannels((prev) => ({ ...prev, [name]: !prev[name] })),
    [],
  )

  // --- voice -------------------------------------------------------------

  const openVoice = useCallback(() => useAiFeature(() => setVoiceOpen(true)), [useAiFeature])

  const closeVoice = useCallback(() => {
    setVoiceOpen(false)
    setListening(false)
  }, [])

  /** Fakes a mic session: listen for a beat, then answer the next scripted turn. */
  const toggleListening = useCallback(() => {
    setListening((wasListening) => {
      window.clearTimeout(listenTimer.current)
      if (wasListening) return false

      listenTimer.current = window.setTimeout(() => {
        setVoiceTurns((turns) => turns.concat(VOICE_SCRIPT[turns.length % VOICE_SCRIPT.length]))
        setListening(false)
      }, 1400)

      return true
    })
  }, [])

  const askVoice = useCallback((turn: VoiceTurn) => {
    window.clearTimeout(listenTimer.current)
    setVoiceTurns((turns) => turns.concat(turn))
    setListening(false)
  }, [])

  // --- derived cart totals -----------------------------------------------

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((n, item) => n + item.price, 0)
    const fees = Math.round(subtotal * config.serviceFeeRate)
    const total = subtotal + fees
    return {
      subtotal,
      fees,
      total,
      deposit: Math.round(total * config.depositRate),
      freeCancelCount: cart.filter((item) => item.free).length,
    }
  }, [cart])

  const planName = chosenPlan ? PLANS.find((p) => p.id === chosenPlan)?.name : undefined

  return {
    money,

    // search
    query,
    setQuery,
    tab,
    setTab,
    status,
    results,
    criteria,
    typedAnswer: answer.slice(0, typed),
    streaming: status === 'done' && typed < answer.length,
    submitQuery,
    askSuggestion,
    where,
    setWhere,
    month,
    setMonth,
    nights,
    setNights,
    pax,
    setPax,
    travellers,
    submitForm,

    // monetisation
    paywallOpen,
    closePaywall: useCallback(() => setPaywallOpen(false), []),
    choosePlan: useCallback((id: string) => {
      setChosenPlan(id)
      setPaywallOpen(false)
    }, []),
    chosenPlan,
    planName,
    trialDay: Math.min(7, 1 + aiUses),

    // cart
    cart,
    cartOpen,
    toggleCart: useCallback(() => setCartOpen((o) => !o), []),
    addToCart,
    removeFromCart,
    cartTotals,

    // planner
    plannerDays,
    plannerTotals,
    pace,
    setPace: useCallback((p: Pace) => {
      setPace(p)
      setOptimised(false)
    }, []),
    removeDay,
    swapDay,
    addDay: useCallback(() => setExtraDay(true), []),
    optimised,
    optimise: useCallback(() => useAiFeature(() => setOptimised((o) => !o)), [useAiFeature]),
    addPlanToCart,

    // companion
    companionOn,
    activateCompanion,
    resolved,
    dismissed,
    acceptAlert,
    dismissAlert,
    channels,
    toggleChannel,
    channelNames: CHANNEL_NAMES,

    // voice
    voiceOpen,
    openVoice,
    closeVoice,
    listening,
    toggleListening,
    voiceTurns,
    askVoice,

    // misc
    openFaq,
    toggleFaq: useCallback((i: number) => setOpenFaq((cur) => (cur === i ? -1 : i)), []),
    activityFilter,
    setActivityFilter,
  }
}

export type AppStore = ReturnType<typeof useAppStore>

const AppContext = createContext<AppStore | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const store = useAppStore()
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>
}

export function useApp(): AppStore {
  const store = useContext(AppContext)
  if (!store) throw new Error('useApp must be used inside <AppProvider>')
  return store
}
