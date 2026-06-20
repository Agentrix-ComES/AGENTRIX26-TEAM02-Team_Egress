import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  ArrowRight,
  Database,
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { listUsers, type CurrentUser } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ServiceCheck {
  name: string;
  url: string;
  status: "checking" | "ok" | "down";
}

const initialChecks: ServiceCheck[] = [
  { name: "AI Service", url: "/ai/health", status: "checking" },
  { name: "User Service", url: "/users/health", status: "checking" },
];

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:8001/api";

export function AdminPage() {
  const { getToken } = useAuth();
  const { user } = useCurrentUser();
  const [users, setUsers] = useState<CurrentUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [services, setServices] = useState<ServiceCheck[]>(initialChecks);

  const refresh = useCallback(async () => {
    setUsersLoading(true);
    try {
      setUsers(await listUsers(getToken));
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
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
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const adminCount = users.filter((u) => u.role === "Admin").length;
  const healthy = services.filter((s) => s.status === "ok").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-zinc-400">
            Welcome back, {user?.full_name || user?.email}. Operate domain services and inspect shared state.
          </p>
        </div>
        <Button variant="outline" onClick={refresh} className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Total users" value={usersLoading ? "…" : String(users.length)} icon={Users} />
        <Stat label="Admins" value={usersLoading ? "…" : String(adminCount)} icon={UserCog} />
        <Stat label="Services healthy" value={`${healthy} / ${services.length}`} icon={ShieldCheck} />
        <Stat label="Vector DB rows" value="2.1M" icon={Database} hint="mocked" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Quick service health</CardTitle>
            <CardDescription className="text-zinc-500">Live gateway checks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between border border-zinc-800 rounded-lg p-3 bg-zinc-950">
                <div className="font-medium text-zinc-100">{svc.name}</div>
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
                  {svc.status === "checking" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" /> checking
                    </span>
                  ) : (
                    svc.status
                  )}
                </Badge>
              </div>
            ))}
            <Separator className="bg-zinc-800" />
            <Button asChild variant="ghost" className="text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 px-0">
              <Link to="/admin/services">
                Open full services view <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Recent users</CardTitle>
            <CardDescription className="text-zinc-500">Last 5 sign-ups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {usersLoading ? (
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : users.length === 0 ? (
              <div className="text-sm text-zinc-400">No users yet.</div>
            ) : (
              users.slice(0, 5).map((u) => (
                <div key={u.user_id} className="flex items-center justify-between border border-zinc-800 rounded-lg p-3 bg-zinc-950">
                  <div className="min-w-0">
                    <div className="font-medium text-zinc-100 truncate">{u.full_name || u.email}</div>
                    <div className="text-xs text-zinc-500 truncate">{u.email}</div>
                  </div>
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
                </div>
              ))
            )}
            <Separator className="bg-zinc-800" />
            <Button asChild variant="ghost" className="text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 px-0">
              <Link to="/admin/users">
                Open users <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Architecture</CardTitle>
          <CardDescription className="text-zinc-500">
            Snapshot of the platform planes. Detail views live under Services.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Tile icon={Server} title="API Gateway" body="Kong routes /api/users → user-service:8002 and /api/ai → ai-service:8000." />
          <Tile icon={Database} title="Shared memory" body="Postgres (canonical trips) + Qdrant (RAG embeddings) + Neo4j (route graph)." />
          <Tile icon={ShieldCheck} title="Admin allowlist" body="Roles enforced from the ADMIN_EMAILS env var. Reconciled on every user-service startup." />
        </CardContent>
      </Card>
    </div>
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

function Tile({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-indigo-300" />
        <div className="font-medium text-zinc-100">{title}</div>
      </div>
      <div className="text-sm text-zinc-400">{body}</div>
    </div>
  );
}
