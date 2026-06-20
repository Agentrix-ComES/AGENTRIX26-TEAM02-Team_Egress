import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  Lightbulb,
  MapPin,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { TripNode } from "@/types/trip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NodeIcon } from "./node-icon";
import { NodeDot, nodeStateLabel } from "./node-state";

interface Props {
  node: TripNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NodeDetail({ node, open, onOpenChange }: Props) {
  if (!node) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
              <NodeIcon kind={node.kind} className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 text-left">
                {node.title}
                <NodeDot state={node.state} />
              </DialogTitle>
              <DialogDescription className="text-left flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {node.location}
                <span>·</span>
                {format(parseISO(node.start), "MMM d · HH:mm")} —{" "}
                {format(parseISO(node.end), "HH:mm")}
              </DialogDescription>
            </div>
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
          </div>
        </DialogHeader>

        <Separator />

        <p className="text-sm">{node.description}</p>

        {node.vendor && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground mb-0.5">Vendor</div>
              <div className="font-medium">{node.vendor}</div>
            </div>
            {node.bookingRef && (
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground mb-0.5">Booking ref</div>
                <div className="font-medium font-mono">{node.bookingRef}</div>
              </div>
            )}
          </div>
        )}

        {node.warnings && node.warnings.length > 0 && (
          <section>
            <div className="flex items-center gap-2 text-sm font-medium mb-2 text-[hsl(var(--node-red))]">
              <AlertTriangle className="h-4 w-4" />
              Conflicts &amp; warnings
            </div>
            <ul className="space-y-1.5 text-sm">
              {node.warnings.map((w, i) => (
                <li key={i} className="rounded-md bg-[hsl(var(--node-red)/0.08)] px-3 py-2">
                  {w}
                </li>
              ))}
            </ul>
          </section>
        )}

        {node.recommendations && node.recommendations.length > 0 && (
          <section>
            <div className="flex items-center gap-2 text-sm font-medium mb-2 text-primary">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </div>
            <ul className="space-y-1.5 text-sm">
              {node.recommendations.map((r, i) => (
                <li key={i} className="rounded-md bg-primary/5 px-3 py-2">
                  {r}
                </li>
              ))}
            </ul>
          </section>
        )}

        {node.cultural && (
          <section>
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Sparkles className="h-4 w-4" /> Cultural notes
            </div>
            <p className="rounded-md bg-muted px-3 py-2 text-sm">{node.cultural}</p>
          </section>
        )}

        {node.risk && (
          <section>
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <ShieldCheck className="h-4 w-4" /> Risk
            </div>
            <p className="rounded-md bg-muted px-3 py-2 text-sm">{node.risk}</p>
          </section>
        )}

        {node.food && node.food.length > 0 && (
          <section>
            <div className="text-sm font-medium mb-2">Nearby dining</div>
            <div className="grid gap-2">
              {node.food.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.cuisine}</div>
                  </div>
                  <div className="text-xs">★ {f.rating}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {typeof node.cost === "number" && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Receipt className="h-4 w-4" /> Estimated cost
            </div>
            <div className="font-semibold">USD {node.cost}</div>
          </div>
        )}

        <Separator />
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm">Reschedule</Button>
          <Button variant="outline" size="sm">Replace</Button>
          <Button variant="destructive" size="sm">Drop</Button>
          <Button size="sm">Apply recovery plan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
