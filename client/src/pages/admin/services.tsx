import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ServiceCheck {
  name: string;
  url: string;
  status: "checking" | "ok" | "down";
}

const initialChecks: ServiceCheck[] = [
  { name: "AI Service", url: "/ai/health", status: "checking" },
  { name: "User Service", url: "/users/health", status: "checking" },
];

const domainServices = [
  { name: "Itinerary Optimizer", load: 38 },
  { name: "Routing & Transport", load: 71 },
  { name: "Climate & Seasonality", load: 22 },
  { name: "Events & Festivals", load: 89 },
  { name: "Cultural Knowledge", load: 14 },
  { name: "Alerts Scraper", load: 9 },
  { name: "Notification Service", load: 31 },
];

const externalFeeds = [
  { name: "Weather & Advisories APIs", status: "ok" },
  { name: "Maps / Geocoding / Routing", status: "ok" },
  { name: "Train / Bus / Park Status", status: "limited" },
  { name: "Official Tourism Content", status: "ok" },
  { name: "News Feeds (Special Events)", status: "ok" },
];

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:8001/api";

export function AdminServicesPage() {
  const [services, setServices] = useState<ServiceCheck[]>(initialChecks);

  const ping = useCallback(async () => {
    setServices(initialChecks);
    const results = await Promise.all(
      initialChecks.map(async (svc) => {
        try {
          const res = await fetch(`${API_BASE}${svc.url}`);
          return { ...svc, status: (res.ok ? "ok" : "down") as ServiceCheck["status"] };
        } catch {
          return { ...svc, status: "down" as ServiceCheck["status"] };
        }
      }),
    );
    setServices(results);
  }, []);

  useEffect(() => {
    ping();
  }, [ping]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="text-zinc-400">Live gateway health and domain-service status.</p>
        </div>
        <Button variant="outline" onClick={ping} className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Service health</CardTitle>
          <CardDescription className="text-zinc-500">Live checks via Kong gateway.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between border border-zinc-800 rounded-lg p-3 bg-zinc-950">
              <div>
                <div className="font-medium text-zinc-100">{svc.name}</div>
                <div className="text-xs text-zinc-500">{API_BASE}{svc.url}</div>
              </div>
              <Badge
                variant="outline"
                className={
                  svc.status === "ok"
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                    : svc.status === "down"
                      ? "border-rose-400/40 bg-rose-500/10 text-rose-300"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300"
                }
              >
                {svc.status === "checking" ? "checking…" : svc.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Domain services</CardTitle>
          <CardDescription className="text-zinc-500">Mocked load metrics — wire to real telemetry later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {domainServices.map((s) => (
            <div key={s.name} className="grid grid-cols-[1fr_220px] items-center gap-4 border border-zinc-800 rounded-lg p-3 bg-zinc-950">
              <div className="font-medium text-zinc-100">{s.name}</div>
              <div>
                <Progress value={s.load} />
                <div className="text-xs text-zinc-500 mt-1">{s.load}% load</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">External feeds</CardTitle>
          <CardDescription className="text-zinc-500">Upstream availability snapshot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {externalFeeds.map((f) => (
            <div key={f.name} className="flex items-center justify-between border border-zinc-800 rounded-lg p-3 bg-zinc-950">
              <div className="font-medium text-zinc-100">{f.name}</div>
              <Badge
                variant="outline"
                className={
                  f.status === "ok"
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-400/40 bg-amber-500/10 text-amber-300"
                }
              >
                {f.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
