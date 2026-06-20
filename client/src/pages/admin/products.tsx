import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  MapPin,
  RefreshCw,
  Star,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchPlaces,
  runIngest,
  type Place,
  type PlaceCategory,
  type PlacesResponse,
} from "@/lib/api";

const PAGE_SIZE = 24;

const categoryLabel: Record<PlaceCategory, string> = {
  hotels: "Hotels",
  activities: "Activities",
  transport: "Transport",
};

export function AdminProductsPage() {
  const { getToken } = useAuth();
  const [category, setCategory] = useState<PlaceCategory>("hotels");
  const [city, setCity] = useState("");
  const [subtype, setSubtype] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PlacesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState(false);

  const load = useCallback(
    async (overrides?: { resetPage?: boolean }) => {
      setLoading(true);
      setError(null);
      try {
        const offset = overrides?.resetPage ? 0 : page * PAGE_SIZE;
        const res = await fetchPlaces(getToken, {
          category,
          city: city.trim() || undefined,
          subtype: subtype.trim() || undefined,
          limit: PAGE_SIZE,
          offset,
        });
        setData(res);
        if (overrides?.resetPage) setPage(0);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [category, city, subtype, page, getToken],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page]);

  const onIngest = async () => {
    setIngesting(true);
    try {
      const res = await runIngest(getToken, category, 200);
      toast.success(`Ingested ${categoryLabel[category]}.`);
      console.log("ingest result", res);
      await load({ resetPage: true });
    } catch (err) {
      toast.error(`Ingest failed: ${(err as Error).message}`);
    } finally {
      setIngesting(false);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total_in_collection / PAGE_SIZE)) : 1;
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Products catalogue</h1>
          <p className="text-zinc-400">
            POIs stored in Qdrant — hotels, activities, and transport nodes ingested from OpenStreetMap.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => load()} className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={onIngest} disabled={ingesting} className="bg-indigo-500 hover:bg-indigo-600 text-white">
            {ingesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {ingesting ? "Ingesting…" : `Ingest ${categoryLabel[category]}`}
          </Button>
        </div>
      </div>

      <Tabs
        value={category}
        onValueChange={(v) => {
          setCategory(v as PlaceCategory);
          setPage(0);
        }}
      >
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">
            {categoryLabel[category]} ·{" "}
            <span className="text-zinc-500 font-normal">
              {data ? `${data.total_in_collection.toLocaleString()} in collection` : "—"}
            </span>
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Filter by city or subtype, then page through results.
          </CardDescription>
          <div className="pt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Kandy)"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
            <Input
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
              placeholder="Subtype (e.g. hotel, museum, station)"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
            <Button
              variant="outline"
              onClick={() => load({ resetPage: true })}
              className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100"
            >
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-rose-400">Failed to load: {error}</div>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
            </div>
          ) : items.length === 0 ? (
            <EmptyState category={category} onIngest={onIngest} ingesting={ingesting} />
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <ProductCard key={item.id} item={item} category={category} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                returned={items.length}
                total={data?.total_in_collection ?? 0}
                onPrev={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProductCard({ item, category }: { item: Place; category: PlaceCategory }) {
  const secondary = useMemo(() => {
    switch (category) {
      case "hotels":
        return [item.property_type, item.price_tier].filter(Boolean) as string[];
      case "activities":
        return [item.activity_category, item.indoor_outdoor, item.fee && `fee: ${item.fee}`].filter(
          Boolean,
        ) as string[];
      case "transport":
        return [item.mode, item.operator].filter(Boolean) as string[];
    }
  }, [category, item]);

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden flex flex-col">
      <div className="aspect-[16/9] bg-zinc-900 grid place-items-center text-zinc-700">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name ?? ""}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <ImageIcon className="h-8 w-8" />
        )}
      </div>
      <div className="p-3 space-y-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium text-zinc-100 truncate">{item.name ?? "Unnamed"}</div>
            <div className="text-xs text-zinc-500 flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {[item.city, item.region].filter(Boolean).join(", ") || "—"}
            </div>
          </div>
          {item.star_rating != null && (
            <Badge variant="outline" className="border-amber-400/40 bg-amber-500/10 text-amber-300 shrink-0">
              <Star className="h-3 w-3 mr-1" />
              {item.star_rating}
            </Badge>
          )}
        </div>
        {item.subtype && (
          <Badge variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300">
            {item.subtype}
          </Badge>
        )}
        {secondary.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {secondary.map((s) => (
              <Badge key={s} variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-400 text-[10px]">
                {s}
              </Badge>
            ))}
          </div>
        )}
        {item.description && (
          <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
        )}
        {item.website && (
          <a
            href={item.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200"
          >
            Website <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  returned,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  returned: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = page * PAGE_SIZE + 1;
  const end = page * PAGE_SIZE + returned;
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages && returned === PAGE_SIZE;
  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800">
      <div className="text-xs text-zinc-500">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={onPrev}
          className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={onNext}
          className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  category,
  onIngest,
  ingesting,
}: {
  category: PlaceCategory;
  onIngest: () => void;
  ingesting: boolean;
}) {
  return (
    <div className="text-center py-10 space-y-3">
      <div className="text-zinc-300 font-medium">No {categoryLabel[category].toLowerCase()} stored yet</div>
      <p className="text-sm text-zinc-500 max-w-md mx-auto">
        Ingest from OpenStreetMap to populate the catalogue. This pulls Sri Lanka POIs into Qdrant.
      </p>
      <Button onClick={onIngest} disabled={ingesting} className="bg-indigo-500 hover:bg-indigo-600 text-white">
        {ingesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {ingesting ? "Ingesting…" : `Ingest ${categoryLabel[category]}`}
      </Button>
    </div>
  );
}
