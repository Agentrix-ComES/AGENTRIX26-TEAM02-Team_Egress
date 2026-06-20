import { Database, Server, ShieldCheck, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const services = [
  { name: "Itinerary Optimizer", status: "healthy", load: 38 },
  { name: "Routing & Transport", status: "healthy", load: 71 },
  { name: "Climate & Seasonality", status: "healthy", load: 22 },
  { name: "Events & Festivals", status: "degraded", load: 89 },
  { name: "Cultural Knowledge", status: "healthy", load: 14 },
  { name: "Alerts Scraper", status: "healthy", load: 9 },
  { name: "Notification Service", status: "healthy", load: 31 },
];

const externalFeeds = [
  { name: "Weather & Advisories APIs", status: "ok" },
  { name: "Maps / Geocoding / Routing", status: "ok" },
  { name: "Train / Bus / Park Status", status: "limited" },
  { name: "Official Tourism Content", status: "ok" },
  { name: "News Feeds (Special Events)", status: "ok" },
];

const partners = [
  { name: "Cinnamon Hotels", type: "Stay", bookings: 142 },
  { name: "ExpoRail", type: "Transport", bookings: 88 },
  { name: "Leopard Trails", type: "Activity", bookings: 36 },
  { name: "Jetwing", type: "Stay", bookings: 91 },
];

export function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin / Partner Console</h1>
        <p className="text-muted-foreground">
          Administrative plane — operate the domain services and inspect shared state.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Active trips" value="1,284" icon={Zap} />
        <Stat label="Agents online" value="4 / 4" icon={ShieldCheck} />
        <Stat label="Domain services" value="7 / 7" icon={Server} />
        <Stat label="Vector DB rows" value="2.1M" icon={Database} />
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Domain services</TabsTrigger>
          <TabsTrigger value="feeds">External feeds</TabsTrigger>
          <TabsTrigger value="memory">Shared memory</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-3">
          {services.map((s) => (
            <Card key={s.name}>
              <CardContent className="p-4 grid grid-cols-[1fr_120px_180px_120px] items-center gap-4">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">domain-service</div>
                </div>
                <Badge variant={s.status === "healthy" ? "success" : "warning"}>
                  {s.status}
                </Badge>
                <div>
                  <Progress value={s.load} />
                  <div className="text-xs text-muted-foreground mt-1">{s.load}% load</div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Switch defaultChecked />
                  <span className="text-xs text-muted-foreground">enabled</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="feeds" className="space-y-3">
          {externalFeeds.map((f) => (
            <Card key={f.name}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="font-medium">{f.name}</div>
                <Badge variant={f.status === "ok" ? "success" : "warning"}>{f.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="memory" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Trip DB (PostgreSQL)</CardTitle>
              <CardDescription>Canonical timeline & node states.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Row k="Tables" v="trips, nodes, bookings, audits" />
              <Row k="Rows" v="184,221" />
              <Row k="Replication lag" v="48ms" />
              <Separator />
              <Button size="sm" variant="outline">Open psql shell</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vector DB (RAG / embeddings)</CardTitle>
              <CardDescription>Preferences, past decisions, similar trips.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Row k="Collections" v="preferences, decisions, cultural-kb" />
              <Row k="Vectors" v="2,124,902" />
              <Row k="Index health" v={<Badge variant="success">green</Badge>} />
              <Separator />
              <Button size="sm" variant="outline">Re-index cultural-kb</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-3">
          {partners.map((p) => (
            <Card key={p.name}>
              <CardContent className="p-4 grid grid-cols-[1fr_120px_120px_120px] items-center gap-4">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.type}</div>
                </div>
                <div className="text-sm">{p.bookings} bookings</div>
                <Badge variant="outline">active</Badge>
                <div className="text-right">
                  <Button size="sm" variant="ghost">Open</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold mt-0.5">{value}</div>
        </div>
        <Icon className="h-6 w-6 text-primary" />
      </CardContent>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b pb-1 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
