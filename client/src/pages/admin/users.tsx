import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listUsers, type CurrentUser } from "@/lib/api";

export function AdminUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<CurrentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers(getToken));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.full_name, u.email, u.role].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [users, query]);

  const adminCount = users.filter((u) => u.role === "Admin").length;
  const userCount = users.length - adminCount;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-zinc-400">
            {users.length} total · {adminCount} admin{adminCount === 1 ? "" : "s"} · {userCount} traveller{userCount === 1 ? "" : "s"}
          </p>
        </div>
        <Button variant="outline" onClick={refresh} className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Registered users</CardTitle>
          <CardDescription className="text-zinc-500">
            Roles are driven by the ADMIN_EMAILS env allowlist on the user-service.
          </CardDescription>
          <div className="relative pt-2 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, or role…"
              className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-rose-400">Failed to load: {error}</div>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-zinc-400">No users match.</div>
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
                  {filtered.map((u) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
