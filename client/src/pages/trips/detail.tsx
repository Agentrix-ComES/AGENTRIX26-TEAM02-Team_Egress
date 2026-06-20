import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarRange,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createAlert,
  createDiningReservation,
  createHotelBooking,
  createRegionNode,
  createTransportBooking,
  deleteDiningReservation,
  deleteHotelBooking,
  deleteRegionNode,
  deleteTransportBooking,
  getTrip,
  listAlerts,
  listDiningReservations,
  listHotelBookings,
  listTransportBookings,
  getTimeline,
  type DiningReservationResponse,
  type HotelBookingResponse,
  type RegionNodeResponse,
  type TransportBookingResponse,
  type TripAlertResponse,
  type TripDetailResponse,
} from "@/lib/api";

export function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { getToken } = useAuth();
  const [trip, setTrip] = useState<TripDetailResponse | null>(null);
  const [regions, setRegions] = useState<RegionNodeResponse[]>([]);
  const [transport, setTransport] = useState<TransportBookingResponse[]>([]);
  const [hotels, setHotels] = useState<HotelBookingResponse[]>([]);
  const [dining, setDining] = useState<DiningReservationResponse[]>([]);
  const [alerts, setAlerts] = useState<TripAlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const [t, tl, tr, hb, dr, al] = await Promise.all([
        getTrip(getToken, tripId),
        getTimeline(getToken, tripId),
        listTransportBookings(getToken, { trip_id: tripId }),
        listHotelBookings(getToken, { trip_id: tripId }),
        listDiningReservations(getToken, { trip_id: tripId }),
        listAlerts(getToken, tripId),
      ]);
      setTrip(t);
      setRegions(tl.regions);
      setTransport(tr);
      setHotels(hb);
      setDining(dr);
      setAlerts(al);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken, tripId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading trip…
      </div>
    );
  }
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!trip) return <p>Trip not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/trips">
            <ArrowLeft className="h-4 w-4" /> All trips
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-3 flex-wrap mt-2">
          <div>
            <h1 className="text-2xl font-semibold">{trip.title}</h1>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <MapPin className="h-3.5 w-3.5" /> {trip.destination}
              <span className="mx-1">·</span>
              <CalendarRange className="h-3.5 w-3.5" />
              {format(parseISO(trip.start_date), "MMM d")} →{" "}
              {format(parseISO(trip.end_date), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{trip.status}</Badge>
            <Badge variant="outline">
              {trip.budget ?? 0} {trip.currency}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <TimelineTab
            tripId={trip.id}
            regions={regions}
            onAdd={async (body) => {
              const r = await createRegionNode(getToken, trip.id, body);
              setRegions((rs) => [...rs, r].sort((a, b) => a.sequence - b.sequence));
              toast.success("Region added");
            }}
            onDelete={async (id) => {
              await deleteRegionNode(getToken, trip.id, id);
              setRegions((rs) => rs.filter((r) => r.id !== id));
              toast.success("Region removed");
            }}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTab
            tripId={trip.id}
            regions={regions}
            transport={transport}
            hotels={hotels}
            dining={dining}
            onAddTransport={async (body) => {
              const r = await createTransportBooking(getToken, body);
              setTransport((x) => [r, ...x]);
              toast.success("Transport booked");
            }}
            onDeleteTransport={async (id) => {
              await deleteTransportBooking(getToken, id);
              setTransport((x) => x.filter((t) => t.id !== id));
            }}
            onAddHotel={async (body) => {
              const r = await createHotelBooking(getToken, body);
              setHotels((x) => [r, ...x]);
              toast.success("Hotel booked");
            }}
            onDeleteHotel={async (id) => {
              await deleteHotelBooking(getToken, id);
              setHotels((x) => x.filter((h) => h.id !== id));
            }}
            onAddDining={async (body) => {
              const r = await createDiningReservation(getToken, body);
              setDining((x) => [r, ...x]);
              toast.success("Reservation made");
            }}
            onDeleteDining={async (id) => {
              await deleteDiningReservation(getToken, id);
              setDining((x) => x.filter((d) => d.id !== id));
            }}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsTab
            regions={regions}
            alerts={alerts}
            onCreate={async (body) => {
              const a = await createAlert(getToken, trip.id, body);
              setAlerts((x) => [a, ...x]);
              toast.success("Alert raised");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Timeline tab ----------

function TimelineTab({
  regions,
  onAdd,
  onDelete,
}: {
  tripId: string;
  regions: RegionNodeResponse[];
  onAdd: (body: {
    name: string;
    start_date: string;
    end_date: string;
    description?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Timeline regions</CardTitle>
            <CardDescription>Group activities by region — e.g. "Kandy", "Ella".</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" /> Add region</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add region to timeline</DialogTitle>
                <DialogDescription>Bracket dates for this leg.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  setSaving(true);
                  try {
                    await onAdd({
                      name: String(fd.get("name") ?? ""),
                      description: String(fd.get("description") ?? "") || undefined,
                      start_date: new Date(String(fd.get("start_date"))).toISOString(),
                      end_date: new Date(String(fd.get("end_date"))).toISOString(),
                    });
                    setOpen(false);
                  } catch (err) {
                    toast.error((err as Error).message);
                  } finally {
                    setSaving(false);
                  }
                }}
                className="grid gap-3"
              >
                <Field label="Name" name="name" required />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start" name="start_date" type="date" required />
                  <Field label="End" name="end_date" type="date" required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="description">Notes</Label>
                  <Textarea id="description" name="description" rows={2} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {regions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No regions yet.</p>
        ) : (
          regions.map((r) => (
            <div key={r.id} className="flex items-center justify-between border rounded-lg p-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(parseISO(r.start_date), "MMM d, yyyy")} →{" "}
                  {format(parseISO(r.end_date), "MMM d, yyyy")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.state}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (!window.confirm("Remove region?")) return;
                    try {
                      await onDelete(r.id);
                    } catch (err) {
                      toast.error((err as Error).message);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Bookings tab ----------

function BookingsTab(props: {
  tripId: string;
  regions: RegionNodeResponse[];
  transport: TransportBookingResponse[];
  hotels: HotelBookingResponse[];
  dining: DiningReservationResponse[];
  onAddTransport: (body: Parameters<typeof createTransportBooking>[1]) => Promise<void>;
  onDeleteTransport: (id: string) => Promise<void>;
  onAddHotel: (body: Parameters<typeof createHotelBooking>[1]) => Promise<void>;
  onDeleteHotel: (id: string) => Promise<void>;
  onAddDining: (body: Parameters<typeof createDiningReservation>[1]) => Promise<void>;
  onDeleteDining: (id: string) => Promise<void>;
}) {
  const { tripId, regions } = props;

  if (regions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Add at least one timeline region before booking — region nodes anchor each booking.
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="transport" className="space-y-3">
      <TabsList>
        <TabsTrigger value="transport">Transport ({props.transport.length})</TabsTrigger>
        <TabsTrigger value="hotels">Hotels ({props.hotels.length})</TabsTrigger>
        <TabsTrigger value="dining">Dining ({props.dining.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="transport">
        <TransportSection
          tripId={tripId}
          regions={regions}
          items={props.transport}
          onAdd={props.onAddTransport}
          onDelete={props.onDeleteTransport}
        />
      </TabsContent>
      <TabsContent value="hotels">
        <HotelsSection
          tripId={tripId}
          regions={regions}
          items={props.hotels}
          onAdd={props.onAddHotel}
          onDelete={props.onDeleteHotel}
        />
      </TabsContent>
      <TabsContent value="dining">
        <DiningSection
          tripId={tripId}
          regions={regions}
          items={props.dining}
          onAdd={props.onAddDining}
          onDelete={props.onDeleteDining}
        />
      </TabsContent>
    </Tabs>
  );
}

function TransportSection({
  tripId,
  regions,
  items,
  onAdd,
  onDelete,
}: {
  tripId: string;
  regions: RegionNodeResponse[];
  items: TransportBookingResponse[];
  onAdd: (body: Parameters<typeof createTransportBooking>[1]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transport bookings</CardTitle>
          <CardDescription>Trains, buses, transfers — link to a timeline region.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New transport booking</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setSaving(true);
                try {
                  await onAdd({
                    trip_id: tripId,
                    region_node_id: String(fd.get("region_node_id") ?? ""),
                    title: String(fd.get("title") ?? ""),
                    mode: String(fd.get("mode") ?? "train"),
                    departure_location: String(fd.get("departure_location") ?? ""),
                    arrival_location: String(fd.get("arrival_location") ?? ""),
                    departure_time: new Date(String(fd.get("departure_time"))).toISOString(),
                    arrival_time: new Date(String(fd.get("arrival_time"))).toISOString(),
                    estimated_cost: Number(fd.get("estimated_cost")) || undefined,
                    booking_status: "pending",
                  });
                  setOpen(false);
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
              className="grid gap-3"
            >
              <RegionSelect regions={regions} />
              <Field label="Title" name="title" required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mode" name="mode" defaultValue="train" />
                <Field label="Estimated cost" name="estimated_cost" type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="From" name="departure_location" required />
                <Field label="To" name="arrival_location" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Departs" name="departure_time" type="datetime-local" required />
                <Field label="Arrives" name="arrival_time" type="datetime-local" required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transport bookings.</p>
        ) : (
          items.map((b) => (
            <RowCard
              key={b.id}
              title={b.title}
              subtitle={`${b.departure_location} → ${b.arrival_location}`}
              meta={`${format(parseISO(b.departure_time), "MMM d, HH:mm")} · ${b.mode}`}
              status={b.booking_status}
              onDelete={async () => {
                if (window.confirm("Cancel this booking?")) {
                  try {
                    await onDelete(b.id);
                  } catch (err) {
                    toast.error((err as Error).message);
                  }
                }
              }}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function HotelsSection({
  tripId,
  regions,
  items,
  onAdd,
  onDelete,
}: {
  tripId: string;
  regions: RegionNodeResponse[];
  items: HotelBookingResponse[];
  onAdd: (body: Parameters<typeof createHotelBooking>[1]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hotel bookings</CardTitle>
          <CardDescription>Use a hotel_id from your catalogue or search results.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New hotel booking</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setSaving(true);
                try {
                  await onAdd({
                    trip_id: tripId,
                    region_node_id: String(fd.get("region_node_id") ?? ""),
                    hotel_id: String(fd.get("hotel_id") ?? ""),
                    room_type: String(fd.get("room_type") ?? "standard"),
                    check_in_date: String(fd.get("check_in_date")),
                    check_out_date: String(fd.get("check_out_date")),
                    guests: Number(fd.get("guests")) || undefined,
                    rooms: Number(fd.get("rooms")) || undefined,
                    special_requests: String(fd.get("special_requests") ?? "") || undefined,
                  });
                  setOpen(false);
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
              className="grid gap-3"
            >
              <RegionSelect regions={regions} />
              <Field label="Hotel ID" name="hotel_id" required />
              <Field label="Room type" name="room_type" defaultValue="standard" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check-in" name="check_in_date" type="date" required />
                <Field label="Check-out" name="check_out_date" type="date" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Guests" name="guests" type="number" defaultValue="2" />
                <Field label="Rooms" name="rooms" type="number" defaultValue="1" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="special_requests">Special requests</Label>
                <Textarea id="special_requests" name="special_requests" rows={2} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hotel bookings.</p>
        ) : (
          items.map((b) => (
            <RowCard
              key={b.id}
              title={b.hotel_name ?? b.hotel_id}
              subtitle={`${b.room_type} · ${b.guests ?? "?"} guests`}
              meta={`${b.check_in_date} → ${b.check_out_date}`}
              status={b.status}
              onDelete={async () => {
                if (window.confirm("Cancel this booking?")) {
                  try {
                    await onDelete(b.id);
                  } catch (err) {
                    toast.error((err as Error).message);
                  }
                }
              }}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function DiningSection({
  tripId,
  regions,
  items,
  onAdd,
  onDelete,
}: {
  tripId: string;
  regions: RegionNodeResponse[];
  items: DiningReservationResponse[];
  onAdd: (body: Parameters<typeof createDiningReservation>[1]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Dining reservations</CardTitle>
          <CardDescription>Use a dining_option_id from the destination catalogue.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New dining reservation</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setSaving(true);
                try {
                  await onAdd({
                    trip_id: tripId,
                    region_node_id: String(fd.get("region_node_id") ?? "") || undefined,
                    dining_option_id: String(fd.get("dining_option_id") ?? ""),
                    date: String(fd.get("date")),
                    time: String(fd.get("time")),
                    party_size: Number(fd.get("party_size")) || 2,
                    special_requests: String(fd.get("special_requests") ?? "") || undefined,
                  });
                  setOpen(false);
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
              className="grid gap-3"
            >
              <RegionSelect regions={regions} optional />
              <Field label="Dining option ID" name="dining_option_id" required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date" name="date" type="date" required />
                <Field label="Time" name="time" defaultValue="19:00" required />
              </div>
              <Field label="Party size" name="party_size" type="number" defaultValue="2" />
              <div className="grid gap-1.5">
                <Label htmlFor="special_requests">Special requests</Label>
                <Textarea id="special_requests" name="special_requests" rows={2} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reserve"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dining reservations.</p>
        ) : (
          items.map((r) => (
            <RowCard
              key={r.id}
              title={r.dining_option_name ?? r.dining_option_id}
              subtitle={`${r.party_size} guests · ${r.time}`}
              meta={r.date}
              status={r.status}
              onDelete={async () => {
                if (window.confirm("Cancel this reservation?")) {
                  try {
                    await onDelete(r.id);
                  } catch (err) {
                    toast.error((err as Error).message);
                  }
                }
              }}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Alerts ----------

function AlertsTab({
  regions,
  alerts,
  onCreate,
}: {
  regions: RegionNodeResponse[];
  alerts: TripAlertResponse[];
  onCreate: (body: Parameters<typeof createAlert>[2]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Disruptions, delays, weather events. Tied to a region.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><AlertTriangle className="h-4 w-4" /> Raise alert</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Raise an alert</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setSaving(true);
                try {
                  await onCreate({
                    title: String(fd.get("title") ?? ""),
                    description: String(fd.get("description") ?? "") || undefined,
                    alert_type: String(fd.get("alert_type") ?? "weather"),
                    severity: String(fd.get("severity") ?? "medium"),
                    affected_region_id: String(fd.get("affected_region_id") ?? ""),
                    delay_minutes: Number(fd.get("delay_minutes")) || undefined,
                    source: "user_report",
                  });
                  setOpen(false);
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
              className="grid gap-3"
            >
              <Field label="Title" name="title" required />
              <RegionSelect regions={regions} fieldName="affected_region_id" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type" name="alert_type" defaultValue="weather" />
                <Field label="Severity" name="severity" defaultValue="medium" />
              </div>
              <Field label="Delay (minutes)" name="delay_minutes" type="number" />
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Raise"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts.</p>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {a.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.alert_type} · {a.severity}
                  {a.delay_minutes ? ` · +${a.delay_minutes} min` : ""}
                </div>
              </div>
              <Badge variant="outline">{a.status}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ---------- shared ----------

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

function RegionSelect({
  regions,
  fieldName = "region_node_id",
  optional,
}: {
  regions: RegionNodeResponse[];
  fieldName?: string;
  optional?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={fieldName}>Region {optional && <span className="text-xs text-muted-foreground">(optional)</span>}</Label>
      <select
        id={fieldName}
        name={fieldName}
        required={!optional}
        defaultValue={optional ? "" : regions[0]?.id}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        {optional && <option value="">No region</option>}
        {regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function RowCard({
  title,
  subtitle,
  meta,
  status,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  status?: string;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border rounded-lg p-3">
      <div className="min-w-0">
        <div className="font-medium truncate">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
        {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
      </div>
      <div className="flex items-center gap-2">
        {status && <Badge variant="outline">{status}</Badge>}
        {onDelete && (
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        )}
      </div>
    </div>
  );
}
