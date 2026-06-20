import { useState } from "react";
import { format, parseISO } from "date-fns";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { mockAlerts } from "@/data/mock";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Alert } from "@/types/trip";
import { cn } from "@/lib/utils";

export function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const ack = (id: string) =>
    setAlerts((arr) => arr.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));

  const open = alerts.filter((a) => !a.acknowledged);
  const ackd = alerts.filter((a) => a.acknowledged);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Alerts</h1>
        <p className="text-muted-foreground">
          Surfaced by the proactive disruption pipeline (Cron → Scraper → Disruption Agent →
          Notification → user).
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Critical" count={alerts.filter((a) => a.severity === "critical").length} variant="danger" icon={ShieldAlert} />
        <Stat label="Warnings" count={alerts.filter((a) => a.severity === "warning").length} variant="warning" icon={AlertTriangle} />
        <Stat label="Info" count={alerts.filter((a) => a.severity === "info").length} variant="secondary" icon={Info} />
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged ({ackd.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="space-y-3">
          {open.map((a) => (
            <AlertCard key={a.id} alert={a} onAck={() => ack(a.id)} />
          ))}
        </TabsContent>
        <TabsContent value="acknowledged" className="space-y-3">
          {ackd.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  label,
  count,
  variant,
  icon: Icon,
}: {
  label: string;
  count: number;
  variant: "danger" | "warning" | "secondary";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const tone = {
    danger: "text-[hsl(var(--node-red))]",
    warning: "text-[hsl(var(--node-active))]",
    secondary: "text-muted-foreground",
  }[variant];
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold mt-0.5">{count}</div>
        </div>
        <Icon className={cn("h-6 w-6", tone)} />
      </CardContent>
    </Card>
  );
}

function AlertCard({ alert, onAck }: { alert: Alert; onAck?: () => void }) {
  const variant =
    alert.severity === "critical" ? "danger" : alert.severity === "warning" ? "warning" : "outline";
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant={variant as never}>{alert.severity}</Badge>
              {alert.title}
            </CardTitle>
            <CardDescription>
              {alert.source} ·{" "}
              {format(parseISO(alert.receivedAt), "MMM d · HH:mm")}
              {alert.affectedNodeId && (
                <>
                  {" "}
                  · affects <span className="font-mono">{alert.affectedNodeId}</span>
                </>
              )}
            </CardDescription>
          </div>
          {onAck ? (
            <Button size="sm" variant="outline" onClick={onAck}>
              <CheckCircle2 className="h-4 w-4" /> Acknowledge
            </Button>
          ) : (
            <Badge variant="success">Acknowledged</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{alert.body}</p>
      </CardContent>
    </Card>
  );
}
