import type { Itinerary as ApiItinerary, ChatRequest, ChatResponse } from "@/types/api";
import type { Trip, TripNode, NodeKind } from "@/types/trip";
import { authedFetch, asJson, qs, type TokenGetter } from "./core";

export async function sendChat(
  getToken: TokenGetter,
  body: ChatRequest,
): Promise<ChatResponse> {
  const res = await authedFetch("/ai/chat", getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<ChatResponse>(res);
}

export type PlaceCategory = "hotels" | "activities" | "transport";

export interface Place {
  id: string;
  name: string | null;
  category: string | null;
  subtype: string | null;
  city: string | null;
  region: string | null;
  address: string | null;
  lat: number | null;
  lon: number | null;
  image_url: string | null;
  website: string | null;
  opening_hours: string | null;
  description: string | null;
  property_type: string | null;
  star_rating: number | null;
  price_tier: string | null;
  activity_category: string | null;
  indoor_outdoor: string | null;
  fee: string | null;
  mode: string | null;
  operator: string | null;
}

export interface PlacesResponse {
  category: PlaceCategory;
  total_in_collection: number;
  returned: number;
  offset: number;
  next_offset: string | null;
  filters_applied: Record<string, unknown>;
  items: Place[];
}

export interface FetchPlacesParams {
  category: PlaceCategory;
  city?: string;
  subtype?: string;
  has_image?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchPlaces(
  getToken: TokenGetter,
  params: FetchPlacesParams,
): Promise<PlacesResponse> {
  const path =
    "/ai/data/places" +
    qs({
      category: params.category,
      city: params.city,
      subtype: params.subtype,
      has_image: params.has_image,
      limit: params.limit ?? 24,
      offset: params.offset ?? 0,
    });
  const res = await authedFetch(path, getToken);
  return asJson<PlacesResponse>(res);
}

export async function runIngest(
  getToken: TokenGetter,
  category: PlaceCategory | "all" = "all",
  limit = 200,
): Promise<Record<string, unknown>> {
  const res = await authedFetch(`/ai/data/ingest${qs({ category, limit })}`, getToken, {
    method: "POST",
  });
  return asJson(res);
}

const kindFromType: Record<string, NodeKind> = {
  hotel: "stay",
  activity: "activity",
  transport: "transport",
  meal: "food",
};

function parseTime(date: string | null | undefined, time: string | null | undefined): string {
  const d = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
  const hhmm = time && /^\d{1,2}:\d{2}/.test(time) ? time : "09:00";
  const [h, m] = hhmm.split(":");
  return `${d}T${h.padStart(2, "0")}:${m}:00`;
}

function addMinutes(iso: string, mins: number): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString().slice(0, 19);
}

export function itineraryToTrip(
  itinerary: ApiItinerary,
  meta: { id: string; title: string; preferences?: string[] },
): Trip {
  const nodes: TripNode[] = [];
  let idx = 0;
  for (const day of itinerary.days ?? []) {
    for (const item of day.items ?? []) {
      const start = parseTime(day.date, item.time);
      const end = addMinutes(start, 90);
      nodes.push({
        id: `n${idx++}`,
        kind: kindFromType[item.type] ?? "activity",
        title: item.title,
        location: item.location ?? day.location ?? itinerary.destination ?? "",
        start,
        end,
        state: "green",
        description: item.notes ?? "",
      });
    }
  }
  return {
    id: meta.id,
    title: meta.title,
    destination: itinerary.destination ?? "",
    startDate: itinerary.start_date ?? "",
    endDate: itinerary.end_date ?? "",
    travelers: 1,
    budget: 0,
    currency: "USD",
    preferences: meta.preferences ?? [],
    progress: 0,
    nodes,
  };
}
