import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendChat, itineraryToTrip } from "@/lib/api";

const interestOptions = [
  "Culture",
  "Trains",
  "Tea country",
  "Beaches",
  "Wildlife",
  "Hiking",
  "Photography",
  "Food",
  "Adventure",
  "Slow travel",
];

export function PlanTripPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [interests, setInterests] = useState<string[]>(["Culture", "Trains"]);
  const [generating, setGenerating] = useState(false);

  const toggle = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "Sri Lanka trip");
    const start = String(fd.get("start") ?? "");
    const end = String(fd.get("end") ?? "");
    const travelers = Number(fd.get("travelers") ?? 1);
    const budget = Number(fd.get("budget") ?? 0);
    const pace = String(fd.get("pace") ?? "balanced");
    const notes = String(fd.get("notes") ?? "");

    const message = [
      `Plan a ${pace} trip titled "${title}" from ${start} to ${end} in Sri Lanka.`,
      `${travelers} traveller(s), budget USD ${budget}.`,
      interests.length ? `Interests: ${interests.join(", ")}.` : "",
      notes ? `Additional notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    setGenerating(true);
    try {
      const res = await sendChat(getToken, {
        message,
        preferences: interests,
        start_date: start || undefined,
        end_date: end || undefined,
      });
      const trip = res.itinerary
        ? itineraryToTrip(res.itinerary, {
            id: res.conversation_id,
            title,
            preferences: interests,
          })
        : undefined;
      navigate("/workspace", {
        state: {
          conversationId: res.conversation_id,
          trip: trip ? { ...trip, travelers, budget } : undefined,
          initialReply: res.reply,
        },
      });
    } catch (err) {
      console.error("Plan request failed", err);
      toast.error("Couldn't generate the timeline. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Plan a trip</h1>
          <p className="text-muted-foreground">
            Give the orchestrator your goals — the four agents will build a timeline you can edit.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trip basics</CardTitle>
            <CardDescription>What and when. Be loose — the agents fill the rest.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Trip title</Label>
                <Input id="title" name="title" placeholder="e.g. Hill country & temples" defaultValue="Sri Lanka Heritage & Hills" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start">Start date</Label>
                  <Input id="start" name="start" type="date" defaultValue="2026-07-12" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end">End date</Label>
                  <Input id="end" name="end" type="date" defaultValue="2026-07-19" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="travelers">Travelers</Label>
                  <Input id="travelers" name="travelers" type="number" min={1} defaultValue={2} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input id="budget" name="budget" type="number" min={0} defaultValue={2400} />
                </div>
                <div className="grid gap-2">
                  <Label>Pace</Label>
                  <Select name="pace" defaultValue="balanced">
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
              </div>
              <div className="grid gap-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((i) => {
                    const on = interests.includes(i);
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => toggle(i)}
                        className={
                          "rounded-full border px-3 py-1 text-xs transition-colors " +
                          (on
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-accent")
                        }
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Anything else?</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Dietary needs, accessibility, must-see places, things to avoid…"
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating timeline…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" /> Generate timeline
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> How the agents help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <AgentRow name="Planner" body="Builds the timeline using your interests, season, and events." />
            <AgentRow name="Logistics" body="Sequences transport, transfers, and stay check-ins to fit." />
            <AgentRow name="Disruption" body="Reserves buffer where weather, delays, or closures are likely." />
            <AgentRow name="Culture" body="Surfaces dress codes, timing, and etiquette for temples & festivals." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Implicit context</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>The Vector DB remembers your decisions — next trip, you can say less.</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline">Vegetarian</Badge>
              <Badge variant="outline">Quiet hotels</Badge>
              <Badge variant="outline">No early starts</Badge>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function AgentRow({ name, body }: { name: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center text-xs font-semibold shrink-0">
        {name[0]}
      </div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
