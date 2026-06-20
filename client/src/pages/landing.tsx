import { Link } from "react-router-dom";
import { ArrowRight, Compass, Sparkles, ShieldAlert, Map, Globe2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Sparkles,
    title: "Living timeline",
    body: "Every trip is a sequence of nodes — transport, stays, visits, meals, temples — that the platform monitors as the day unfolds.",
  },
  {
    icon: ShieldAlert,
    title: "Disruption recovery",
    body: "Delays, closures, storms, traffic — propagated through the rest of the day with proposed recovery plans, not just alerts.",
  },
  {
    icon: Globe2,
    title: "Cultural awareness",
    body: "Dress codes, photography rules, religious timing, and festival impacts surfaced before you arrive at every temple and shrine.",
  },
  {
    icon: Map,
    title: "Sri Lanka first",
    body: "Built for hill-country trains, coastal routes, wildlife parks and the dense cultural triangle.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-semibold">Egress</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Button asChild size="sm">
              <Link to="/plan">Plan a trip</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <Badge variant="secondary" className="mb-4">
          <Users className="h-3 w-3 mr-1" /> Team_Egress · Interim submission
        </Badge>
        <h1 className="text-4xl lg:text-6xl font-semibold tracking-tight max-w-3xl">
          Travel that{" "}
          <span className="bg-gradient-to-r from-primary via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
            reschedules itself
          </span>{" "}
          when reality changes.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
          An AI-powered timeline travel assistant for Sri Lanka. Plans, watches, and rebuilds the
          rest of your day when a train is delayed, a storm closes a road, or a temple ceremony
          runs long.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/plan">
              Start planning <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/timeline">See sample timeline</Link>
          </Button>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-5">
                <f.icon className="h-5 w-5 text-primary mb-3" />
                <div className="font-medium mb-1">{f.title}</div>
                <div className="text-sm text-muted-foreground">{f.body}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
