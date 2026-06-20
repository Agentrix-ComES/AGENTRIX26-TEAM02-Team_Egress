import { Bell, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";

export function Topbar() {
  const { theme, toggle } = useTheme();
  return (
    <header className="h-16 border-b bg-background/70 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Ask anything about your trip…" className="pl-9" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Alerts">
            <Bell className="h-4 w-4" />
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/15 text-primary">SE</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
