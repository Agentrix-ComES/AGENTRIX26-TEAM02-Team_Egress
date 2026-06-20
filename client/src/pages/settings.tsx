import { Bell, Globe, KeyRound, Languages, Moon, Sun, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";

export function SettingsPage() {
  const { theme, toggle } = useTheme();
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Profile, preferences, and notification channels.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </CardTitle>
          <CardDescription>Used by the orchestrator as implicit context.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" defaultValue="Sudesh Thashmika" />
          <Field label="Email" defaultValue="sudesh@creativesoftware.com" type="email" />
          <Field label="Phone" defaultValue="+94 77 ••• ••••" />
          <Field label="Home base" defaultValue="Colombo, LK" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> Travel preferences
          </CardTitle>
          <CardDescription>Defaults applied when planning a new trip.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Pace</Label>
              <Select defaultValue="balanced">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Diet</Label>
              <Select defaultValue="veg">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preference</SelectItem>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Default currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="lkr">LKR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Toggle label="Avoid early-morning starts" desc="Schedule activities after 08:00 when possible." defaultChecked />
          <Toggle label="Prefer trains over road transfers" desc="When time and route allow." defaultChecked />
          <Toggle label="Cultural deep-dives" desc="Add temple and heritage context to suggestions." defaultChecked />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Toggle label="Email" desc="Daily digest and critical alerts." defaultChecked />
          <Toggle label="Push (web/mobile)" desc="Real-time disruption alerts." defaultChecked />
          <Toggle label="WhatsApp" desc="Sent only for affected nodes." defaultChecked />
          <Toggle label="Telegram" desc="Sent only for affected nodes." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="font-medium">Dark mode</div>
            <div className="text-sm text-muted-foreground">
              Currently {theme === "dark" ? "on" : "off"}.
            </div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggle} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-4 w-4" /> Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select defaultValue="en">
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="si">සිංහල</SelectItem>
              <SelectItem value="ta">தமிழ்</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline">Change password</Button>
          <Button variant="outline">Export trip data</Button>
          <Separator orientation="vertical" className="h-8" />
          <Button variant="destructive">Delete account</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input {...props} />
    </div>
  );
}

function Toggle({
  label,
  desc,
  defaultChecked,
}: {
  label: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
