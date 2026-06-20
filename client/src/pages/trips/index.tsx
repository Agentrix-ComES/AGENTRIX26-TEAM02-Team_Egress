import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ArrowRight, CalendarRange, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTrip, deleteTrip, listTrips, type TripResponse } from "@/lib/api";

export function TripsPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listTrips(getToken, { limit: 20 });
      setTrips(res.items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setCreating(true);
    try {
      const trip = await createTrip(getToken, {
        title: String(fd.get("title") ?? ""),
        description: String(fd.get("description") ?? "") || undefined,
        destination: String(fd.get("destination") ?? ""),
        start_date: new Date(String(fd.get("start_date"))).toISOString(),
        end_date: new Date(String(fd.get("end_date"))).toISOString(),
        budget: Number(fd.get("budget") ?? 0),
        currency: String(fd.get("currency") ?? "USD"),
        travel_style: String(fd.get("travel_style") ?? "") || undefined,
      });
      toast.success(`Trip "${trip.title}" created`);
      setOpen(false);
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      toast.error(`Failed to create: ${(err as Error).message}`);
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this trip? This cannot be undone.")) return;
    try {
      await deleteTrip(getToken, id);
      setTrips((t) => t.filter((x) => x.id !== id));
      toast.success("Trip deleted");
    } catch (err) {
      toast.error(`Delete failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">My trips</h1>
          <p className="text-muted-foreground">Plan, view, and manage every journey.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a new trip</DialogTitle>
              <DialogDescription>
                Set the basics — you can add the timeline, bookings, and alerts inside.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onCreate} className="grid gap-3">
              <Field label="Title" name="title" required defaultValue="Sri Lanka Heritage & Hills" />
              <Field label="Destination" name="destination" required defaultValue="Sri Lanka" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start" name="start_date" type="date" required defaultValue="2026-07-12" />
                <Field label="End" name="end_date" type="date" required defaultValue="2026-07-19" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Budget" name="budget" type="number" defaultValue="2400" />
                <Field label="Currency" name="currency" defaultValue="USD" />
              </div>
              <Field label="Travel style" name="travel_style" defaultValue="balanced" />
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <Card><CardContent className="p-6 text-sm text-rose-600">{error}</CardContent></Card>
      ) : loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading trips…
        </div>
      ) : trips.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-2">
            <CalendarRange className="h-8 w-8 mx-auto text-muted-foreground" />
            <div className="font-medium">No trips yet</div>
            <p className="text-sm text-muted-foreground">Create your first one to start a timeline.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{t.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {t.destination}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{t.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CalendarRange className="h-3.5 w-3.5" />
                  {format(parseISO(t.start_date), "MMM d")} →{" "}
                  {format(parseISO(t.end_date), "MMM d, yyyy")}
                </div>
                {t.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/trips/${t.id}`}>
                      Open <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-500"
                    onClick={() => onDelete(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} />
    </div>
  );
}
