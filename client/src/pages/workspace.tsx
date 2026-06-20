import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Loader2, MapPin, Send, Sparkles, Wand2 } from "lucide-react";
import { mockChat, mockTrip } from "@/data/mock";
import { sendChat, itineraryToTrip } from "@/lib/api";
import type { ChatMessage, Trip, TripNode } from "@/types/trip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NodeIcon } from "@/components/timeline/node-icon";
import { NodeDot, nodeStateLabel } from "@/components/timeline/node-state";
import { NodeDetail } from "@/components/timeline/node-detail";
import { StreamText } from "@/components/chat/stream-text";
import { cn } from "@/lib/utils";

const agentMeta: Record<string, { color: string; label: string }> = {
  orchestrator: { color: "bg-primary/15 text-primary", label: "Orchestrator" },
  planner: { color: "bg-emerald-500/15 text-emerald-600", label: "Planner" },
  logistics: { color: "bg-sky-500/15 text-sky-600", label: "Logistics" },
  disruption: { color: "bg-rose-500/15 text-rose-600", label: "Disruption" },
  culture: { color: "bg-amber-500/15 text-amber-600", label: "Culture" },
};

const quickPrompts = [
  "There's traffic on the way to Kandy",
  "Add a beach day before we fly home",
  "Skip the temple visit",
  "It's raining in Ella tomorrow",
  "We're done with the train, what's next?",
  "Replan the whole trip",
];

function groupByDay(nodes: TripNode[]) {
  const map = new Map<string, TripNode[]>();
  for (const n of nodes) {
    const day = n.start.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(n);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function snapshotMap(trip: Trip) {
  return new Map(trip.nodes.map((n) => [n.id, JSON.stringify(n)]));
}

interface WorkspaceLocationState {
  conversationId?: string;
  trip?: Trip;
  initialReply?: string;
}

export function WorkspacePage() {
  const { getToken } = useAuth();
  const location = useLocation();
  const incoming = (location.state ?? {}) as WorkspaceLocationState;

  const [trip, setTrip] = useState<Trip>(incoming.trip ?? mockTrip);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (incoming.initialReply) {
      return [
        {
          id: "m-init",
          role: "assistant",
          agent: "orchestrator",
          content: incoming.initialReply,
          timestamp: new Date().toISOString(),
        },
      ];
    }
    return mockChat;
  });
  const [conversationId, setConversationId] = useState<string | undefined>(incoming.conversationId);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState<TripNode | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => groupByDay(trip.nodes), [trip.nodes]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const flashTouched = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setTouched((prev) => {
      const next = new Set(prev);
      ids.forEach((i) => next.add(i));
      return next;
    });
    window.setTimeout(() => {
      setTouched((prev) => {
        const next = new Set(prev);
        ids.forEach((i) => next.delete(i));
        return next;
      });
    }, 1600);
  }, []);

  const run = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || busy) return;
      setBusy(true);

      const userMsg: ChatMessage = {
        id: `m${Date.now()}`,
        role: "user",
        content: t,
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");

      try {
        const res = await sendChat(getToken, {
          message: t,
          conversation_id: conversationId,
          preferences: trip.preferences,
          destination: trip.destination || undefined,
          start_date: trip.startDate || undefined,
          end_date: trip.endDate || undefined,
        });
        setConversationId(res.conversation_id);

        setMessages((arr) => [
          ...arr,
          {
            id: `m${Date.now()}-r`,
            role: "assistant",
            agent: "orchestrator",
            content: res.reply,
            timestamp: new Date().toISOString(),
          },
        ]);

        if (res.itinerary) {
          setTrip((prev) => {
            const before = snapshotMap(prev);
            const next = itineraryToTrip(res.itinerary!, {
              id: prev.id,
              title: prev.title,
              preferences: prev.preferences,
            });
            const changed: string[] = [];
            for (const n of next.nodes) {
              if (before.get(n.id) !== JSON.stringify(n)) changed.push(n.id);
            }
            flashTouched(changed);
            return next;
          });
        }
      } catch (err) {
        console.error("Chat call failed", err);
        setMessages((arr) => [
          ...arr,
          {
            id: `m${Date.now()}-e`,
            role: "assistant",
            agent: "orchestrator",
            content: "Sorry — the agents couldn't reach the planner. Please try again.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, conversationId, flashTouched, getToken, trip.destination, trip.endDate, trip.preferences, trip.startDate],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] h-[calc(100vh-7rem)]">
      {/* Chat column */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Trip Workspace
              </CardTitle>
              <CardDescription>
                Chat to plan and reshape your timeline — agents will animate the changes.
              </CardDescription>
            </div>
            <Badge variant={busy ? "warning" : "success"}>
              {busy ? "Agents working…" : "4 agents online"}
            </Badge>
          </div>
        </CardHeader>

        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((m, idx) => (
              <Bubble key={m.id} m={m} isLatest={idx === messages.length - 1 && !busy} />
            ))}
            {busy && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl bg-muted px-4 py-2 text-sm rounded-tl-sm flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Agents reasoning…
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t p-3 space-y-2 bg-card">
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q) => (
              <button
                key={q}
                disabled={busy}
                onClick={() => run(q)}
                className="text-[11px] rounded-full border px-2.5 py-1 hover:bg-accent disabled:opacity-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell the orchestrator what changed…"
              disabled={busy}
            />
            <Button type="submit" size="icon" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>

      {/* Timeline column */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate">{trip.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {trip.destination} · {trip.startDate} → {trip.endDate}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{trip.nodes.length} nodes</Badge>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => run("replan the whole trip")}>
                <Wand2 className="h-4 w-4" /> Re-optimize
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <LayoutGroup>
            {days.map(([day, nodes]) => (
              <motion.section key={day} layout>
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card/80 backdrop-blur-sm py-1 z-10">
                  <div className="text-sm font-medium">
                    {format(parseISO(day), "EEEE, MMM d")}
                  </div>
                  <div className="text-xs text-muted-foreground">{nodes.length} items</div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                  <ul className="space-y-2">
                    <AnimatePresence initial={false}>
                      {nodes.map((n) => (
                        <motion.li
                          key={n.id}
                          layout
                          initial={{ opacity: 0, y: 14, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -16, scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 320, damping: 28 }}
                          className="relative"
                        >
                          <span className="absolute -left-[18px] top-4">
                            <NodeDot state={n.state} />
                          </span>
                          <button
                            onClick={() => {
                              setSelected(n);
                              setOpenDetail(true);
                            }}
                            className={cn(
                              "w-full text-left rounded-xl border bg-background p-3 hover:bg-accent/40 transition-colors relative overflow-hidden",
                              n.state === "active" &&
                                "ring-2 ring-[hsl(var(--node-active)/0.4)]",
                              n.state === "red" && "border-[hsl(var(--node-red)/0.5)]",
                            )}
                          >
                            {touched.has(n.id) && (
                              <motion.span
                                aria-hidden
                                initial={{ opacity: 0.7 }}
                                animate={{ opacity: 0 }}
                                transition={{ duration: 1.4 }}
                                className="absolute inset-0 pointer-events-none bg-primary/15"
                              />
                            )}
                            <div className="flex items-start gap-3">
                              <div className="grid place-items-center h-9 w-9 rounded-lg bg-muted shrink-0">
                                <NodeIcon kind={n.kind} className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    variant={
                                      n.state === "red"
                                        ? "danger"
                                        : n.state === "purple"
                                          ? "purple"
                                          : n.state === "active"
                                            ? "warning"
                                            : "success"
                                    }
                                  >
                                    {nodeStateLabel(n.state)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {format(parseISO(n.start), "HH:mm")} —{" "}
                                    {format(parseISO(n.end), "HH:mm")}
                                  </span>
                                </div>
                                <div className="font-medium truncate">{n.title}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {n.location}
                                </div>
                                {n.warnings && n.warnings.length > 0 && (
                                  <motion.div
                                    layout
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mt-1.5 text-xs text-[hsl(var(--node-red))]"
                                  >
                                    ⚠ {n.warnings[0]}
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              </motion.section>
            ))}
          </LayoutGroup>
        </div>
      </Card>

      <NodeDetail node={selected} open={openDetail} onOpenChange={setOpenDetail} />
    </div>
  );
}

function Bubble({ m, isLatest }: { m: ChatMessage; isLatest: boolean }) {
  const isUser = m.role === "user";
  const meta = m.agent ? agentMeta[m.agent] : null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn("text-xs", meta?.color ?? (isUser ? "bg-primary text-primary-foreground" : "bg-secondary"))}>
          {isUser ? "U" : (meta?.label[0] ?? "A")}
        </AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[85%] space-y-1", isUser && "items-end flex flex-col")}>
        {meta && (
          <Badge variant="outline" className="text-[10px]">
            {meta.label} agent
          </Badge>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted rounded-tl-sm",
          )}
        >
          {isLatest && !isUser ? <StreamText text={m.content} /> : m.content}
        </div>
      </div>
    </motion.div>
  );
}
