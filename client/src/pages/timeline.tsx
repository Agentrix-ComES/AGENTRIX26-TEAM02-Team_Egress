import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, Filter, RefreshCcw, MapPin } from "lucide-react";
import { mockTrip } from "@/data/mock";
import type { TripNode } from "@/types/trip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NodeCard } from "@/components/timeline/node-card";
import { NodeDetail } from "@/components/timeline/node-detail";
import { NodeDot } from "@/components/timeline/node-state";

function groupByDay(nodes: TripNode[]) {
  const map = new Map<string, TripNode[]>();
  for (const n of nodes) {
    const day = n.start.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(n);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function TimelinePage() {
  const [selected, setSelected] = useState<TripNode | null>(null);
  const [open, setOpen] = useState(false);
  const days = useMemo(() => groupByDay(mockTrip.nodes), []);

  const stats = {
    green: mockTrip.nodes.filter((n) => n.state === "green").length,
    red: mockTrip.nodes.filter((n) => n.state === "red").length,
    purple: mockTrip.nodes.filter((n) => n.state === "purple").length,
    active: mockTrip.nodes.filter((n) => n.state === "active").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{mockTrip.title}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            {mockTrip.destination} · {mockTrip.startDate} → {mockTrip.endDate} ·{" "}
            {mockTrip.travelers} travelers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4" /> Re-optimize
          </Button>
          <Button>
            <CalendarDays className="h-4 w-4" /> Add node
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-3 p-4">
          <LegendChip color="green" label="OK" count={stats.green} />
          <LegendChip color="active" label="Active" count={stats.active} />
          <LegendChip color="red" label="Disruption" count={stats.red} />
          <LegendChip color="purple" label="Completed" count={stats.purple} />
          <div className="ml-auto flex flex-wrap gap-1.5">
            {mockTrip.preferences.map((p) => (
              <Badge key={p} variant="outline">
                {p}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {days.map(([day, nodes]) => (
          <section key={day}>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-sm font-medium">
                {format(parseISO(day), "EEEE, MMM d")}
              </div>
              <div className="text-xs text-muted-foreground">
                {nodes.length} items · {nodes.filter((n) => n.state === "red").length} flagged
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="absolute left-8 top-6 bottom-6 w-px bg-border" />
                  <ul className="divide-y">
                    {nodes.map((n) => (
                      <li key={n.id} className="p-4 pl-12 relative">
                        <span className="absolute left-7 top-7 -translate-x-1/2">
                          <NodeDot state={n.state} />
                        </span>
                        <NodeCard
                          node={n}
                          onClick={() => {
                            setSelected(n);
                            setOpen(true);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        ))}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Delay propagation preview</CardTitle>
          <CardDescription>
            If the active train arrives 25 min late, three downstream nodes shift and one conflicts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Train → Kandy arrives 11:35 → 12:00</li>
            <li>Temple of the Tooth pushed to 17:30 puja slot</li>
            <li>Tea tasting dropped to absorb buffer</li>
            <li>Dinner reservation stays at 19:30 ✅</li>
          </ol>
        </CardContent>
      </Card>

      <NodeDetail node={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function LegendChip({
  color,
  label,
  count,
}: {
  color: "green" | "red" | "purple" | "active";
  label: string;
  count: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
      <NodeDot state={color} />
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">{count}</span>
    </div>
  );
}
