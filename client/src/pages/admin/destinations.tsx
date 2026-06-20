import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { ArrowRight, Loader2, MapPinned, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createRegion, deleteRegion, listRegions, type RegionResponse } from "@/lib/api";

export function AdminDestinationsPage() {
  const { getToken } = useAuth();
  const [regions, setRegions] = useState<RegionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listRegions(getToken, { search: search || undefined, limit: 50 });
      setRegions(res.items);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const r = await createRegion(getToken, {
        name: String(fd.get("name") ?? ""),
        country: String(fd.get("country") ?? "Sri Lanka"),
        description: String(fd.get("description") ?? "") || undefined,
        region_code: String(fd.get("region_code") ?? "") || undefined,
        latitude: Number(fd.get("latitude")) || undefined,
        longitude: Number(fd.get("longitude")) || undefined,
        timezone: String(fd.get("timezone") ?? "Asia/Colombo") || undefined,
      });
      setRegions((x) => [r, ...x]);
      toast.success(`Region "${r.name}" created`);
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this region?")) return;
    try {
      await deleteRegion(getToken, id);
      setRegions((x) => x.filter((r) => r.id !== id));
      toast.success("Region deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Destinations</h1>
          <p className="text-zinc-400">
            Regions and their catalogue: locations, activities, dining, emergency, offers, culture.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
              <Plus className="h-4 w-4" /> New region
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create region</DialogTitle></DialogHeader>
            <form onSubmit={onCreate} className="grid gap-3">
              <Field label="Name" name="name" required defaultValue="Kandy" />
              <Field label="Country" name="country" required defaultValue="Sri Lanka" />
              <Field label="Region code" name="region_code" defaultValue="LK-2" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude" name="latitude" type="number" defaultValue="7.2906" />
                <Field label="Longitude" name="longitude" type="number" defaultValue="80.6337" />
              </div>
              <Field label="Timezone" name="timezone" defaultValue="Asia/Colombo" />
              <Field label="Description" name="description" />
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search regions…"
          className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading regions…
        </div>
      ) : regions.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-10 text-center">
            <MapPinned className="h-8 w-8 mx-auto text-zinc-500" />
            <div className="font-medium text-zinc-100 mt-2">No regions yet</div>
            <p className="text-sm text-zinc-500">Create the first one to start building the catalogue.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {regions.map((r) => (
            <Card key={r.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 truncate">{r.name}</CardTitle>
                <CardDescription className="text-zinc-500">
                  {r.country} {r.region_code ? `· ${r.region_code}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Button asChild size="sm" variant="secondary">
                  <Link to={`/admin/destinations/${r.id}`}>
                    Open catalogue <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(r.id)}>
                  <Trash2 className="h-4 w-4 text-rose-400" />
                </Button>
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
