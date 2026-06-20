import type { TripNode } from "@/types/trip";
import { Badge } from "@/components/ui/badge";
import { NodeDot, nodeStateLabel } from "./node-state";
import { NodeIcon } from "./node-icon";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface Props {
  node: TripNode;
  onClick?: () => void;
}

export function NodeCard({ node, onClick }: Props) {
  const startTime = format(parseISO(node.start), "MMM d · HH:mm");
  const endTime = format(parseISO(node.end), "HH:mm");
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border bg-card p-4 hover:bg-accent/40 transition-colors",
        node.state === "active" && "ring-2 ring-[hsl(var(--node-active)/0.4)]",
        node.state === "red" && "border-[hsl(var(--node-red)/0.5)]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-lg bg-muted text-foreground">
          <NodeIcon kind={node.kind} className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <NodeDot state={node.state} />
            <Badge
              variant={
                node.state === "red"
                  ? "danger"
                  : node.state === "purple"
                    ? "purple"
                    : node.state === "active"
                      ? "warning"
                      : "success"
              }
            >
              {nodeStateLabel(node.state)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {startTime} — {endTime}
            </span>
          </div>
          <div className="font-medium truncate">{node.title}</div>
          <div className="text-sm text-muted-foreground truncate">{node.location}</div>
          {node.warnings && node.warnings.length > 0 && (
            <div className="mt-2 text-xs text-[hsl(var(--node-red))] line-clamp-1">
              ⚠ {node.warnings[0]}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
