import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { listUsers, type CurrentUser } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ServiceCheck {
  name: string;
  url: string;
  status: "checking" | "ok" | "down";
}

const initialServiceChecks: ServiceCheck[] = [
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

const partners = [
  { name: "Cinnamon Hotels", type: "Stay", bookings: 142 },
  { name: "ExpoRail", type: "Transport", bookings: 88 },
  { name: "Leopard Trails", type: "Activity", bookings: 36 },
  { name: "Jetwing", type: "Stay", bookings: 91 },
];

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:8001/api";

export function AdminPage() {
  const { getToken } = useAuth();
  const { user } = useCurrentUser();
  const [users, setUsers] = useState<CurrentUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceCheck[]>(initialServiceChecks);

  const refreshUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      setUsers(await listUsers(getToken));
    } catch (err) {
      setUsersError((err as Error).message);
    } finally {
      setUsersLoading(false);
    }
  };

  const pingServices = async () => {
    setServices(initialServiceChecks);
    const results = await Promise.all(
      initialServiceChecks.map(async (svc) => {
        try {
          const res = await fetch(`${API_BASE}${svc.url}`);
          return { ...svc, status: (res.ok ? "ok" : "down") as ServiceCheck["status"] };
        } catch {
          return { ...svc, status: "down" as ServiceCheck["status"] };
        }
      }),
    );
    setServices(results);
  };

  useEffect(() => {
    refreshUsers();
    pingServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adminCount = useMemo(() => users.filter((u) => u.role === "Admin").length, [users]);
  const userCount = users.length - adminCount;
  const healthy = services.filter((s) => s.status === "ok").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Admin Console</h1>
          <p className="text-zinc-400">
            Welcome back, {user?.full_name || user?.email}. Operate domain services and inspect shared state.
          </p>
        </div>
        <Button variant="outline" onClick={() => { refreshUsers(); pingServices(); }} className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Total users" value={usersLoading ? "…" : String(users.length)} icon={Users} />
        <Stat label="Admins" value={usersLoading ? "…" : String(adminCount)} icon={UserCog} />
        <Stat label="Services healthy" value={`${healthy} / ${services.length}`} icon={ShieldCheck} />
        <Stat label="Domain services" value={`${domainServices.length}`} icon={Server} hint="mocked" />
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="health">Service health</TabsTrigger>
          <TabsTrigger value="services">Domain services</TabsTrigger>
          <TabsTrigger value="feeds">External feeds</TabsTrigger>
          <TabsTrigger value="memory">Shared memory</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <AdminCard
            title="Registered users"
            description={`${users.length} total · ${adminCount} admin${adminCount === 1 ? "" : "s"} · ${userCount} traveller${userCount === 1 ? "" : "s"}`}
          >
            {usersError ? (
              <div className="text-sm text-rose-400">Failed to load: {usersError}</div>
            ) : usersLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
              </div>
            ) : users.length === 0 ? (
              <div className="text-sm text-zinc-400">No users yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-zinc-500 border-b border-zinc-800">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Email</th>
                      <th className="py-2 pr-4 font-medium">Role</th>
                      <th className="py-2 pr-4 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id} className="border-b border-zinc-800/60 last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{u.full_name || "—"}</td>
                        <td className="py-2.5 pr-4 text-zinc-400">{u.email}</td>
                        <td className="py-2.5 pr-4">
                          <Badge
                            variant="outline"
                            className={
                              u.role === "Admin"
                                ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-300"
                                : "border-zinc-700 bg-zinc-900 text-zinc-300"
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-4 text-zinc-400">
                          {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </TabsContent>

        <TabsContent value="health" className="space-y-3">
          {services.map((svc) => (
            <Card key={svc.name} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 flex items-center justify-between">
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
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="services" className="space-y-3">
          {domainServices.map((s) => (
            <Card key={s.name} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 grid grid-cols-[1fr_220px] items-center gap-4">
                <div>
                  <div className="font-medium text-zinc-100">{s.name}</div>
                  <div className="text-xs text-zinc-500">domain-service · mocked</div>
                </div>
                <div>
                  <Progress value={s.load} />
                  <div className="text-xs text-zinc-500 mt-1">{s.load}% load</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="feeds" className="space-y-3">
          {externalFeeds.map((f) => (
            <Card key={f.name} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 flex items-center justify-between">
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
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="memory" className="grid gap-4 md:grid-cols-2">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">Trip DB (PostgreSQL)</CardTitle>
              <CardDescription className="text-zinc-500">Canonical timeline & node states.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-zinc-300">
              <Row k="Tables" v="trips, nodes, bookings, audits" />
              <Row k="Rows" v="184,221" />
              <Row k="Replication lag" v="48ms" />
              <Separator className="bg-zinc-800" />
              <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
                Open psql shell
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">Vector DB (RAG / embeddings)</CardTitle>
              <CardDescription className="text-zinc-500">Preferences, past decisions, similar trips.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-zinc-300">
              <Row k="Collections" v="preferences, decisions, cultural-kb" />
              <Row k="Vectors" v="2,124,902" />
              <Row k="Index health" v={<Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/10 text-emerald-300">green</Badge>} />
              <Separator className="bg-zinc-800" />
              <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
                Re-index cultural-kb
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-3">
          {partners.map((p) => (
            <Card key={p.name} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 grid grid-cols-[1fr_140px_140px_120px] items-center gap-4">
                <div>
                  <div className="font-medium text-zinc-100">{p.name}</div>
                  <div className="text-xs text-zinc-500">{p.type}</div>
                </div>
                <div className="text-sm text-zinc-300">{p.bookings} bookings</div>
                <Badge variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300">active</Badge>
                <div className="text-right">
                  <Button size="sm" variant="ghost" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">Open</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">{title}</CardTitle>
        {description && <CardDescription className="text-zinc-500">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            {label}
            {hint && <span className="text-[10px] uppercase tracking-wider text-zinc-600">{hint}</span>}
          </div>
          <div className="text-2xl font-semibold mt-0.5 text-zinc-100">{value}</div>
        </div>
        <div className="grid place-items-center h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
          <Icon className="h-5 w-5 text-indigo-300" />
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-zinc-800 pb-1 last:border-0 last:pb-0">
      <span className="text-zinc-500">{k}</span>
      <span className="font-medium text-zinc-100">{v}</span>
    </div>
  );
}

