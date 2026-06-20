import { Link } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  CircleDot,
  Clock,
  MapPin,
  Plane,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { mockAlerts, mockTrip, otherTrips } from "@/data/mock";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { NodeDot } from "@/components/timeline/node-state";

export function OverviewPage() {
  const activeNode = mockTrip.nodes.find((n) => n.state === "active");
  const upcoming = mockTrip.nodes.filter((n) => n.state !== "purple").slice(0, 4);
  const unread = mockAlerts.filter((a) => !a.acknowledged);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Welcome back, Sudesh</div>
          <h1 className="text-2xl font-semibold">Your trip orchestrator is watching the timeline.</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/chat">
              <Sparkles className="h-4 w-4" /> Ask the assistant
            </Link>
          </Button>
          <Button asChild>
            <Link to="/plan">
              <Plane className="h-4 w-4" /> Plan a new trip
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active trip" value={mockTrip.title} icon={MapPin} />
        <Stat
          label="Progress"
          value={`${mockTrip.progress}%`}
          icon={TrendingUp}
          extra={<Progress value={mockTrip.progress} className="mt-2" />}
        />
        <Stat label="Upcoming nodes" value={`${upcoming.length}`} icon={CalendarDays} />
        <Stat label="Open alerts" value={`${unread.length}`} icon={Activity} accent="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current focus</CardTitle>
                <CardDescription>What the platform is watching right now.</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/timeline">
                  Full timeline <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeNode && (
              <div className="rounded-xl border p-4 bg-[hsl(var(--node-active)/0.05)]">
                <div className="flex items-center gap-2 mb-2">
                  <NodeDot state="active" />
                  <Badge variant="warning">Active node</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {activeNode.start.slice(11)} — {activeNode.end.slice(11)}
                  </span>
                </div>
                <div className="font-medium">{activeNode.title}</div>
                <div className="text-sm text-muted-foreground">{activeNode.location}</div>
                {activeNode.warnings && (
                  <div className="mt-3 text-sm text-[hsl(var(--node-red))]">
                    ⚠ {activeNode.warnings[0]}
                  </div>
                )}
              </div>
            )}
            <div>
              <div className="text-sm font-medium mb-2">Next up</div>
              <ul className="space-y-2">
                {upcoming.slice(1, 4).map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                  >
                    <NodeDot state={n.state} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {n.location} · {n.start.slice(5, 16).replace("T", " · ")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent alerts</CardTitle>
            <CardDescription>From the proactive disruption pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAlerts.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <CircleDot
                    className={
                      a.severity === "critical"
                        ? "h-3 w-3 text-[hsl(var(--node-red))]"
                        : a.severity === "warning"
                          ? "h-3 w-3 text-[hsl(var(--node-active))]"
                          : "h-3 w-3 text-muted-foreground"
                    }
                  />
                  <span className="font-medium">{a.title}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.body}</p>
              </div>
            ))}
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to="/alerts">View all alerts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your trips</CardTitle>
          <CardDescription>Plans the orchestrator is currently maintaining.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[mockTrip, ...otherTrips].map((t) => (
            <Link
              key={t.id}
              to="/timeline"
              className="rounded-xl border p-4 hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <MapPin className="h-3 w-3" /> {t.destination}
              </div>
              <div className="font-medium mb-1">{t.title}</div>
              <div className="text-xs text-muted-foreground mb-3">
                {t.startDate} — {t.endDate} · {t.travelers} travelers
              </div>
              <Progress value={t.progress} />
              <div className="mt-2 text-xs text-muted-foreground">{t.progress}% completed</div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
  extra,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "warning";
  extra?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{label}</div>
          <Icon
            className={
              accent === "warning"
                ? "h-4 w-4 text-[hsl(var(--node-active))]"
                : "h-4 w-4 text-primary"
            }
          />
        </div>
        <div className="mt-1 text-lg font-semibold truncate">{value}</div>
        {extra}
      </CardContent>
    </Card>
  );
}
