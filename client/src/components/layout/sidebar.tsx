import { NavLink } from "react-router-dom";
import {
  Compass,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  ShieldAlert,
  Smartphone,
  Sparkles,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/app", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/plan", icon: Sparkles, label: "Plan a Trip" },
  { to: "/workspace", icon: MessagesSquare, label: "Workspace" },
  { to: "/alerts", icon: ShieldAlert, label: "Alerts" },
  { to: "/bot", icon: Smartphone, label: "Bot Preview" },
  { to: "/admin", icon: UserCog, label: "Admin / Partner" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r bg-card/30 backdrop-blur-sm flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b">
        <div className="grid place-items-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
          <Compass className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold">Egress</div>
          <div className="text-xs text-muted-foreground">AI Timeline Travel</div>
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
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t">
        <div className="rounded-lg border bg-background p-3 text-xs">
          <div className="font-medium mb-1">Trip Orchestrator</div>
          <div className="text-muted-foreground">
            4 agents online · Vector DB synced
          </div>
        </div>
      </div>
    </aside>
  );
}
