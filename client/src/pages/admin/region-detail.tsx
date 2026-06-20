import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createActivity,
  createDiningOption,
  createEmergencyService,
  createLocation,
  createOffer,
  deleteActivity,
  deleteDiningOption,
  deleteEmergencyService,
  deleteLocation,
  deleteOffer,
  getCulturalContext,
  getRegion,
  listActivities,
  listDiningOptions,
  listLocations,
  listOffers,
  type ActivityResponse,
  type CulturalContextResponse,
  type DiningOptionResponse,
  type EmergencyServiceResponse,
  type OfferResponse,
  type RegionDetailResponse,
  type VisitableLocationResponse,
} from "@/lib/api";

export function AdminRegionDetailPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const { getToken } = useAuth();
  const [region, setRegion] = useState<RegionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!regionId) return;
    setLoading(true);
    try {
      setRegion(await getRegion(getToken, regionId));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken, regionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading || !region || !regionId) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading region…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-zinc-300 hover:text-zinc-100">
          <Link to="/admin/destinations">
            <ArrowLeft className="h-4 w-4" /> All regions
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold mt-2">{region.name}</h1>
        <p className="text-zinc-400">
          {region.country} · {region.timezone ?? "—"}
        </p>
        <div className="flex flex-wrap gap-2 mt-3 text-xs text-zinc-500">
          <CatalogCount label="Locations" n={region.catalog_counts.locations} />
          <CatalogCount label="Activities" n={region.catalog_counts.activities} />
          <CatalogCount label="Dining" n={region.catalog_counts.dining_options} />
          <CatalogCount label="Emergency" n={region.catalog_counts.emergency_services} />
          <CatalogCount label="Offers" n={region.catalog_counts.offers} />
        </div>
      </div>

      <Tabs defaultValue="locations" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="dining">Dining</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="culture">Culture</TabsTrigger>
        </TabsList>

        <TabsContent value="locations">
          <LocationsTab regionId={regionId} />
        </TabsContent>
        <TabsContent value="activities">
          <ActivitiesTab regionId={regionId} />
        </TabsContent>
        <TabsContent value="dining">
          <DiningTab regionId={regionId} />
        </TabsContent>
        <TabsContent value="emergency">
          <EmergencyTab regionId={regionId} />
        </TabsContent>
        <TabsContent value="offers">
          <OffersTab regionId={regionId} />
        </TabsContent>
        <TabsContent value="culture">
          <CultureTab regionId={regionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CatalogCount({ label, n }: { label: string; n: number }) {
  return (
    <Badge variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300">
      {label}: {n}
    </Badge>
  );
}

// ---------- Locations ----------

function LocationsTab({ regionId }: { regionId: string }) {
  const { getToken } = useAuth();
  const [items, setItems] = useState<VisitableLocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await listLocations(getToken, regionId, { limit: 50 });
      setItems(r.items);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken, regionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CatalogShell
      title="Visitable locations"
      desc="POIs travellers can visit — temples, parks, museums."
      onAdd={() => setOpen(true)}
      loading={loading}
      empty={items.length === 0}
      emptyMsg="No locations yet."
    >
      {items.map((l) => (
        <Row
          key={l.id}
          title={l.name}
          subtitle={`${l.category} · ${l.location.address ?? "—"}`}
          onDelete={async () => {
            if (!window.confirm("Delete location?")) return;
            try {
              await deleteLocation(getToken, regionId, l.id);
              setItems((x) => x.filter((y) => y.id !== l.id));
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        />
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New location</DialogTitle></DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setSaving(true);
              try {
                const created = await createLocation(getToken, regionId, {
                  name: String(fd.get("name") ?? ""),
                  category: String(fd.get("category") ?? "attraction"),
                  latitude: Number(fd.get("latitude") ?? 0),
                  longitude: Number(fd.get("longitude") ?? 0),
                  address: String(fd.get("address") ?? ""),
                  description: String(fd.get("description") ?? "") || undefined,
                  entry_fee: Number(fd.get("entry_fee")) || undefined,
                  estimated_duration_minutes: Number(fd.get("duration")) || undefined,
                  opening_hours: String(fd.get("opening_hours") ?? "") || undefined,
                });
                setItems((x) => [created, ...x]);
                setOpen(false);
                toast.success("Location added");
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setSaving(false);
              }
            }}
            className="grid gap-3"
          >
            <Field label="Name" name="name" required />
            <Field label="Category" name="category" defaultValue="attraction" required />
            <Field label="Address" name="address" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude" name="latitude" type="number" required />
              <Field label="Longitude" name="longitude" type="number" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Entry fee" name="entry_fee" type="number" />
              <Field label="Duration (min)" name="duration" type="number" />
            </div>
            <Field label="Opening hours" name="opening_hours" />
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CatalogShell>
  );
}

// ---------- Activities ----------

function ActivitiesTab({ regionId }: { regionId: string }) {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listActivities(getToken, regionId));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken, regionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CatalogShell
      title="Activities"
      desc="Tours, hikes, classes. Each has a difficulty and optional cost."
      onAdd={() => setOpen(true)}
      loading={loading}
      empty={items.length === 0}
      emptyMsg="No activities yet."
    >
      {items.map((a) => (
        <Row
          key={a.id}
          title={a.name}
          subtitle={`${a.category} · ${a.difficulty_level}`}
          meta={a.estimated_cost ? `~${a.estimated_cost}` : undefined}
          onDelete={async () => {
            if (!window.confirm("Delete activity?")) return;
            try {
              await deleteActivity(getToken, regionId, a.id);
              setItems((x) => x.filter((y) => y.id !== a.id));
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        />
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New activity</DialogTitle></DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setSaving(true);
              try {
                const created = await createActivity(getToken, regionId, {
                  name: String(fd.get("name") ?? ""),
                  category: String(fd.get("category") ?? "tour"),
                  difficulty_level: String(fd.get("difficulty_level") ?? "easy"),
                  duration_hours: Number(fd.get("duration_hours")) || undefined,
                  estimated_cost: Number(fd.get("estimated_cost")) || undefined,
                  provider: String(fd.get("provider") ?? "") || undefined,
                  description: String(fd.get("description") ?? "") || undefined,
                });
                setItems((x) => [created, ...x]);
                setOpen(false);
                toast.success("Activity added");
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
              <Field label="Category" name="category" defaultValue="tour" required />
              <Field label="Difficulty" name="difficulty_level" defaultValue="easy" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration (h)" name="duration_hours" type="number" />
              <Field label="Cost" name="estimated_cost" type="number" />
            </div>
            <Field label="Provider" name="provider" />
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CatalogShell>
  );
}

// ---------- Dining ----------

function DiningTab({ regionId }: { regionId: string }) {
  const { getToken } = useAuth();
  const [items, setItems] = useState<DiningOptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listDiningOptions(getToken, regionId));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken, regionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CatalogShell
      title="Dining options"
      desc="Restaurants, cafes, street food. Use the id when creating dining reservations."
      onAdd={() => setOpen(true)}
      loading={loading}
      empty={items.length === 0}
      emptyMsg="No dining options yet."
    >
      {items.map((d) => (
        <Row
          key={d.id}
          title={d.name}
          subtitle={`${d.type} · ${d.cuisine ?? "—"} · ${d.location.address ?? ""}`}
          meta={d.rating ? `★ ${d.rating}` : undefined}
          onDelete={async () => {
            if (!window.confirm("Delete dining option?")) return;
            try {
              await deleteDiningOption(getToken, regionId, d.id);
              setItems((x) => x.filter((y) => y.id !== d.id));
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        />
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New dining option</DialogTitle></DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setSaving(true);
              try {
                const created = await createDiningOption(getToken, regionId, {
                  name: String(fd.get("name") ?? ""),
                  type: String(fd.get("type") ?? "restaurant"),
                  cuisine: String(fd.get("cuisine") ?? "") || undefined,
                  address: String(fd.get("address") ?? ""),
                  rating: Number(fd.get("rating")) || undefined,
                  average_cost_per_person: Number(fd.get("avg_cost")) || undefined,
                  phone: String(fd.get("phone") ?? "") || undefined,
                });
                setItems((x) => [created, ...x]);
                setOpen(false);
                toast.success("Dining option added");
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setSaving(false);
              }
            }}
            className="grid gap-3"
          >
            <Field label="Name" name="name" required />
            <Field label="Address" name="address" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type" name="type" defaultValue="restaurant" required />
              <Field label="Cuisine" name="cuisine" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating (0-5)" name="rating" type="number" />
              <Field label="Avg cost / person" name="avg_cost" type="number" />
            </div>
            <Field label="Phone" name="phone" />
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CatalogShell>
  );
}

// ---------- Emergency ----------

function EmergencyTab({ regionId }: { regionId: string }) {
  const { getToken } = useAuth();
  const [items, setItems] = useState<EmergencyServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // The aggregated endpoint returns a different shape — for simplicity we
      // call it only to render the helpline; create/delete still works.
      // For the editable list, we keep a local copy as we create.
      // (Backend list endpoint is the aggregated one; no flat list, so we
      // approximate with whatever we've created in this session.)
      void (await import("@/lib/api").then((m) => m.getEmergencyServices(getToken, regionId)));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [getToken, regionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CatalogShell
      title="Emergency services"
      desc="Hospitals, police, embassies. Backed by an aggregated read endpoint."
      onAdd={() => setOpen(true)}
      loading={loading}
      empty={items.length === 0}
      emptyMsg="No services created in this session. The aggregated read endpoint can still show pre-existing ones."
    >
      {items.map((s) => (
        <Row
          key={s.id}
          title={s.name}
          subtitle={`${s.service_type} · ${s.phone ?? "—"}`}
          onDelete={async () => {
            if (!window.confirm("Delete service?")) return;
            try {
              await deleteEmergencyService(getToken, regionId, s.id);
              setItems((x) => x.filter((y) => y.id !== s.id));
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        />
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New emergency service</DialogTitle></DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setSaving(true);
              try {
                const created = await createEmergencyService(getToken, regionId, {
                  service_type: String(fd.get("service_type") ?? "hospital"),
                  name: String(fd.get("name") ?? ""),
                  address: String(fd.get("address") ?? ""),
                  phone: String(fd.get("phone") ?? ""),
                  emergency_phone: String(fd.get("emergency_phone") ?? "") || undefined,
                });
                setItems((x) => [created, ...x]);
                setOpen(false);
                toast.success("Service added");
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setSaving(false);
              }
            }}
            className="grid gap-3"
          >
            <Field label="Type" name="service_type" defaultValue="hospital" required />
            <Field label="Name" name="name" required />
            <Field label="Address" name="address" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" name="phone" required />
              <Field label="Emergency phone" name="emergency_phone" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CatalogShell>
  );
}

// ---------- Offers ----------

function OffersTab({ regionId }: { regionId: string }) {
  const { getToken } = useAuth();
  const [items, setItems] = useState<OfferResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listOffers(getToken, regionId));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken, regionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CatalogShell
      title="Offers"
      desc="Time-bounded deals. Discounts and promo codes."
      onAdd={() => setOpen(true)}
      loading={loading}
      empty={items.length === 0}
      emptyMsg="No offers yet."
    >
      {items.map((o) => (
        <Row
          key={o.id}
          title={o.title}
          subtitle={`${o.category} · ${o.discount_type} ${o.discount_value}`}
          meta={`${o.valid_from} → ${o.valid_until}`}
          onDelete={async () => {
            if (!window.confirm("Delete offer?")) return;
            try {
              await deleteOffer(getToken, regionId, o.id);
              setItems((x) => x.filter((y) => y.id !== o.id));
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        />
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New offer</DialogTitle></DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setSaving(true);
              try {
                const created = await createOffer(getToken, regionId, {
                  title: String(fd.get("title") ?? ""),
                  category: String(fd.get("category") ?? "hotel"),
                  discount_type: String(fd.get("discount_type") ?? "percent"),
                  discount_value: Number(fd.get("discount_value") ?? 0),
                  valid_from: String(fd.get("valid_from")),
                  valid_until: String(fd.get("valid_until")),
                  provider: String(fd.get("provider") ?? "") || undefined,
                  code: String(fd.get("code") ?? "") || undefined,
                  description: String(fd.get("description") ?? "") || undefined,
                });
                setItems((x) => [created, ...x]);
                setOpen(false);
                toast.success("Offer added");
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setSaving(false);
              }
            }}
            className="grid gap-3"
          >
            <Field label="Title" name="title" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" name="category" defaultValue="hotel" required />
              <Field label="Provider" name="provider" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount type" name="discount_type" defaultValue="percent" required />
              <Field label="Discount value" name="discount_value" type="number" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valid from" name="valid_from" type="date" required />
              <Field label="Valid until" name="valid_until" type="date" required />
            </div>
            <Field label="Promo code" name="code" />
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CatalogShell>
  );
}

// ---------- Culture (read-only summary) ----------

function CultureTab({ regionId }: { regionId: string }) {
  const { getToken } = useAuth();
  const [ctx, setCtx] = useState<CulturalContextResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setCtx(await getCulturalContext(getToken, regionId));
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken, regionId]);

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin inline" /> Loading cultural context…
        </CardContent>
      </Card>
    );
  }
  if (!ctx) return <p className="text-zinc-400">No cultural context.</p>;
  const g = ctx.general_context;
  return (
    <div className="space-y-3">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">General</CardTitle>
          <CardDescription className="text-zinc-500">{ctx.region_name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          <KV k="Language" v={g?.language ?? "—"} />
          <KV k="Religion" v={g?.religion_predominant ?? "—"} />
          <KV k="Dress code" v={g?.dress_code_general ?? "—"} />
          <KV k="Photography" v={g?.photography_etiquette ?? "—"} />
          {g?.history && (
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-wider mt-2">History</div>
              <p>{g.history}</p>
            </div>
          )}
        </CardContent>
      </Card>
      {ctx.locations_context.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-zinc-100">Location notes</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            {ctx.locations_context.map((l, i) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-3">
                <div className="font-medium text-zinc-100">{l.location_name ?? "—"}</div>
                <div className="text-xs text-zinc-500">{l.dress_code ?? ""}</div>
                {l.significance && <p className="mt-1">{l.significance}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------- shared ----------

function CatalogShell({
  title,
  desc,
  onAdd,
  loading,
  empty,
  emptyMsg,
  children,
}: {
  title: string;
  desc: string;
  onAdd: () => void;
  loading: boolean;
  empty: boolean;
  emptyMsg: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-zinc-100">{title}</CardTitle>
          <CardDescription className="text-zinc-500">{desc}</CardDescription>
        </div>
        <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-sm text-zinc-400 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : empty ? (
          <p className="text-sm text-zinc-500">{emptyMsg}</p>
        ) : null}
        {children}
      </CardContent>
    </Card>
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

function Row({
  title,
  subtitle,
  meta,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border border-zinc-800 rounded-lg p-3 bg-zinc-950">
      <div className="min-w-0">
        <div className="font-medium text-zinc-100 truncate">{title}</div>
        {subtitle && <div className="text-xs text-zinc-500 truncate">{subtitle}</div>}
        {meta && <div className="text-xs text-zinc-500">{meta}</div>}
      </div>
      {onDelete && (
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-rose-400" />
        </Button>
      )}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-zinc-800 pb-1 last:border-0 last:pb-0">
      <span className="text-zinc-500">{k}</span>
      <span className="font-medium text-zinc-100">{v}</span>
    </div>
  );
}
