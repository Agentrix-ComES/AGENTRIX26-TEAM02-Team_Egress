import type { NodeState } from "@/types/trip";
import { cn } from "@/lib/utils";

const map: Record<NodeState, { color: string; ring: string; label: string }> = {
  green: { color: "bg-[hsl(var(--node-green))]", ring: "ring-[hsl(var(--node-green)/0.35)]", label: "OK" },
  red: { color: "bg-[hsl(var(--node-red))]", ring: "ring-[hsl(var(--node-red)/0.35)]", label: "Disruption" },
  purple: { color: "bg-[hsl(var(--node-purple))]", ring: "ring-[hsl(var(--node-purple)/0.35)]", label: "Completed" },
  active: { color: "bg-[hsl(var(--node-active))]", ring: "ring-[hsl(var(--node-active)/0.4)]", label: "Active" },
};

export function NodeDot({ state, className }: { state: NodeState; className?: string }) {
  const m = map[state];
  return (
    <span
      className={cn(
        "inline-block h-3 w-3 rounded-full ring-4",
        m.color,
        m.ring,
        state === "active" && "animate-pulse",
        className,
      )}
    />
  );
}

export function nodeStateLabel(state: NodeState) {
  return map[state].label;
}
