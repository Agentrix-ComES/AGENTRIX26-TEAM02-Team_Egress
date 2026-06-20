import type { ChatMessage, Trip, TripNode } from "@/types/trip";

export interface EngineStep {
  delayMs: number;
  message?: Omit<ChatMessage, "id" | "timestamp">;
  apply?: (trip: Trip) => Trip;
}

function nodeIdx(trip: Trip, predicate: (n: TripNode) => boolean) {
  return trip.nodes.findIndex(predicate);
}

function addMinutes(iso: string, mins: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString().slice(0, 16);
}

function shiftNodes(nodes: TripNode[], fromIdx: number, mins: number): TripNode[] {
  return nodes.map((n, i) =>
    i >= fromIdx ? { ...n, start: addMinutes(n.start, mins), end: addMinutes(n.end, mins) } : n,
  );
}

function nid() {
  return "n" + Math.random().toString(36).slice(2, 8);
}

/**
 * Very simple intent parser that turns chat text into a sequence of
 * orchestrator + agent messages and timeline mutations. Each "intent" plays
 * out as a small animated script — exactly the magic-update feel the UI is
 * meant to demonstrate.
 */
export function interpret(input: string): EngineStep[] {
  const text = input.toLowerCase();

  // Train / traffic delay → push downstream by 25 min, flag temple
  if (/(delay|late|traffic|stuck)/.test(text)) {
    return [
      {
        delayMs: 350,
        message: {
          role: "agent",
          agent: "orchestrator",
          content: "Picking up active node and routing to Disruption Agent…",
        },
      },
      {
        delayMs: 800,
        message: {
          role: "agent",
          agent: "disruption",
          content:
            "Estimating 25 min delay. Propagating to downstream nodes and checking for conflicts.",
        },
        apply: (trip) => {
          const i = nodeIdx(trip, (n) => n.state === "active" || n.kind === "transport");
          if (i < 0) return trip;
          let nodes = shiftNodes(trip.nodes, i + 1, 25);
          nodes = nodes.map((n) =>
            n.kind === "temple"
              ? { ...n, state: "red", warnings: [...(n.warnings ?? []), "Arrival now 16:50 — puja entry closes 17:00."] }
              : n,
          );
          return { ...trip, nodes };
        },
      },
      {
        delayMs: 700,
        message: {
          role: "agent",
          agent: "planner",
          content:
            "Recovery: move temple to 17:30 puja slot and drop the optional tea tasting.",
        },
      },
      {
        delayMs: 600,
        message: {
          role: "agent",
          agent: "culture",
          content:
            "Heads up — 17:30 puja is the busiest. Strict dress code (shoulders & knees covered).",
        },
      },
      {
        delayMs: 400,
        message: {
          role: "assistant",
          content: "Recovery plan applied. Three downstream nodes shifted, temple flagged.",
        },
      },
    ];
  }

  // Add beach day or extra activity
  if (/(add|insert).*(beach|day|hike|surf)/.test(text) || /surf|beach/.test(text)) {
    return [
      {
        delayMs: 350,
        message: {
          role: "agent",
          agent: "planner",
          content: "Slotting a beach day into the timeline — checking transport and weather…",
        },
      },
      {
        delayMs: 900,
        apply: (trip) => {
          const inserted: TripNode = {
            id: nid(),
            kind: "activity",
            title: "Mirissa Beach + sunset whale-watching",
            location: "Mirissa",
            start: "2026-07-18T10:00",
            end: "2026-07-18T18:00",
            state: "green",
            description: "Snorkeling at Coconut Tree Hill cove + 16:30 catamaran sunset cruise.",
            recommendations: ["Reef-safe sunscreen", "Light long-sleeve for boat"],
          };
          return { ...trip, nodes: [...trip.nodes.slice(0, -1), inserted, trip.nodes.at(-1)!] };
        },
        message: {
          role: "agent",
          agent: "logistics",
          content: "Found a 35-min transfer from Galle. Added before Jetwing checkout.",
        },
      },
      {
        delayMs: 500,
        message: {
          role: "assistant",
          content: "Beach day added. Timeline re-balanced.",
        },
      },
    ];
  }

  // Skip / remove temple
  if (/(skip|remove|drop|cancel).*(temple|visit|stop)/.test(text)) {
    return [
      {
        delayMs: 350,
        message: {
          role: "agent",
          agent: "orchestrator",
          content: "Dropping the temple node and recomputing the evening.",
        },
      },
      {
        delayMs: 700,
        apply: (trip) => ({
          ...trip,
          nodes: trip.nodes.filter((n) => n.kind !== "temple"),
        }),
        message: {
          role: "agent",
          agent: "planner",
          content: "Temple removed. Evening freed up — dinner stays.",
        },
      },
      {
        delayMs: 400,
        message: { role: "assistant", content: "Done. You have a quieter evening in Kandy." },
      },
    ];
  }

  // Weather / storm risk
  if (/(rain|storm|weather|wet)/.test(text)) {
    return [
      {
        delayMs: 300,
        message: {
          role: "agent",
          agent: "disruption",
          content: "Pulling weather advisories for hill country…",
        },
      },
      {
        delayMs: 800,
        apply: (trip) => ({
          ...trip,
          nodes: trip.nodes.map((n) =>
            n.kind === "activity" && /hike|peak|mountain/i.test(n.title)
              ? {
                  ...n,
                  state: "red",
                  warnings: [...(n.warnings ?? []), "Heavy rainfall warning — trail may be unsafe."],
                  recommendations: [
                    ...(n.recommendations ?? []),
                    "Fallback: Ravana Falls (shorter, sheltered).",
                  ],
                }
              : n,
          ),
        }),
        message: {
          role: "agent",
          agent: "planner",
          content: "Flagged Little Adam's Peak — proposed Ravana Falls as a safer alternative.",
        },
      },
      {
        delayMs: 400,
        message: {
          role: "assistant",
          content: "Hike flagged red. Accept the alternative or keep the original?",
        },
      },
    ];
  }

  // Mark active node completed (progress)
  if (/(done|complete|finished|arrived)/.test(text)) {
    return [
      {
        delayMs: 400,
        apply: (trip) => {
          const activeIdx = nodeIdx(trip, (n) => n.state === "active");
          if (activeIdx < 0) return trip;
          const nextIdx = trip.nodes.findIndex(
            (n, i) => i > activeIdx && n.state !== "purple",
          );
          return {
            ...trip,
            nodes: trip.nodes.map((n, i) => {
              if (i === activeIdx) return { ...n, state: "purple" };
              if (i === nextIdx) return { ...n, state: "active" };
              return n;
            }),
          };
        },
        message: {
          role: "agent",
          agent: "orchestrator",
          content: "Marked active node complete. Advancing focus to the next item.",
        },
      },
    ];
  }

  // Re-optimize whole trip
  if (/(optim|rebuild|regenerate|replan)/.test(text)) {
    return [
      {
        delayMs: 300,
        message: {
          role: "agent",
          agent: "orchestrator",
          content: "Re-running the four agents over the full timeline…",
        },
      },
      {
        delayMs: 1100,
        apply: (trip) => ({
          ...trip,
          nodes: trip.nodes.map((n) =>
            n.state === "red" ? { ...n, state: "green", warnings: undefined } : n,
          ),
          progress: Math.min(100, trip.progress + 8),
        }),
        message: {
          role: "agent",
          agent: "planner",
          content: "Conflicts cleared. Buffer added before each temple and hike.",
        },
      },
      {
        delayMs: 400,
        message: { role: "assistant", content: "Timeline re-optimized." },
      },
    ];
  }

  // Default: explanatory reply, no mutation
  return [
    {
      delayMs: 400,
      message: {
        role: "agent",
        agent: "orchestrator",
        content:
          "I can do things like: 'train is delayed', 'skip the temple', 'add a beach day', 'rain in Ella', 'we're done with this stop', or 'replan the trip'.",
      },
    },
  ];
}
