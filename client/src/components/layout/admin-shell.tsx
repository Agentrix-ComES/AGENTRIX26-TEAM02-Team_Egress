import { NavLink, Outlet } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Activity, Database, ShieldCheck, Users } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", icon: Activity, label: "Overview", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/services", icon: Database, label: "Services" },
];

export function AdminShell() {
  const { theme, toggle } = useTheme();
  return (
    <div className="flex h-full min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-zinc-800 bg-zinc-900/60 backdrop-blur-sm flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
          <div className="grid place-items-center h-9 w-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30">
            <ShieldCheck className="h-5 w-5 text-indigo-300" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Admin Console</div>
            <div className="text-xs text-zinc-400">Egress · Travel Platform</div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-indigo-500/15 text-indigo-200 font-medium"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-800 text-xs text-zinc-500">
          Administrative plane · isolated from traveller stack
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-400">
              Logged in as administrator · all actions are audited
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="text-zinc-300 hover:text-zinc-100">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <UserButton afterSignOutUrl="/admin/sign-in" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-8 py-6 max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
