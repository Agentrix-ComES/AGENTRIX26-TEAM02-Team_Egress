import { authedFetch, asJson, qs, type TokenGetter } from "./core";

export interface TripCreateRequest {
  title: string;
  description?: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency?: string;
  travel_style?: string;
  dietary_preferences?: string[];
  accessibility_requirements?: string[];
  preferences?: Record<string, unknown>;
}

export interface TripUpdateRequest {
  title?: string;
  description?: string;
  budget?: number;
  travel_style?: string;
  dietary_preferences?: string[];
  accessibility_requirements?: string[];
  preferences?: Record<string, unknown>;
}

export interface TripResponse {
  id: string;
  title: string;
  description?: string | null;
  destination: string;
  status: string;
  start_date: string;
  end_date: string;
  budget?: number | null;
  currency: string;
  travel_style?: string | null;
  dietary_preferences: string[];
  accessibility_requirements: string[];
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TimelineSummaryRegion {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface TripDetailResponse extends TripResponse {
  timeline_summary?: { total_regions: number; regions: TimelineSummaryRegion[] } | null;
}

export interface TripListResponse {
  items: TripResponse[];
  total: number;
}

export async function listTrips(
  getToken: TokenGetter,
  params: { status?: string; skip?: number; limit?: number } = {},
): Promise<TripListResponse> {
  const res = await authedFetch(`/v1/trips${qs(params)}`, getToken);
  return asJson<TripListResponse>(res);
}

export async function getTrip(getToken: TokenGetter, tripId: string): Promise<TripDetailResponse> {
  const res = await authedFetch(`/v1/trips/${tripId}`, getToken);
  return asJson<TripDetailResponse>(res);
}

export async function createTrip(
  getToken: TokenGetter,
  body: TripCreateRequest,
): Promise<TripResponse> {
  const res = await authedFetch("/v1/trips", getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<TripResponse>(res);
}

export async function updateTrip(
  getToken: TokenGetter,
  tripId: string,
  body: TripUpdateRequest,
): Promise<TripResponse> {
  const res = await authedFetch(`/v1/trips/${tripId}`, getToken, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return asJson<TripResponse>(res);
}

export async function deleteTrip(getToken: TokenGetter, tripId: string): Promise<void> {
  const res = await authedFetch(`/v1/trips/${tripId}`, getToken, { method: "DELETE" });
  await asJson<void>(res);
}

// ---------- Region nodes (timeline) ----------

export interface RegionNodeCreateRequest {
  name: string;
  region_id?: string;
  description?: string;
  start_date: string;
  end_date: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface RegionNodeUpdateRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

export interface RegionNodeResponse {
  id: string;
  trip_id: string;
  region_id?: string | null;
  name: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  latitude?: number | null;
  longitude?: number | null;
  state: string;
  sequence: number;
  created_at: string;
  updated_at: string;
}

export interface TimelineResponse {
  trip_id: string;
  regions: RegionNodeResponse[];
  summary: Record<string, unknown>;
}

export async function getTimeline(
  getToken: TokenGetter,
  tripId: string,
): Promise<TimelineResponse> {
  const res = await authedFetch(`/v1/trips/${tripId}/timeline`, getToken);
  return asJson<TimelineResponse>(res);
}

export async function createRegionNode(
  getToken: TokenGetter,
  tripId: string,
  body: RegionNodeCreateRequest,
): Promise<RegionNodeResponse> {
  const res = await authedFetch(`/v1/trips/${tripId}/timeline/regions`, getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<RegionNodeResponse>(res);
}

export async function updateRegionNode(
  getToken: TokenGetter,
  tripId: string,
  regionNodeId: string,
  body: RegionNodeUpdateRequest,
): Promise<RegionNodeResponse> {
  const res = await authedFetch(
    `/v1/trips/${tripId}/timeline/regions/${regionNodeId}`,
    getToken,
    { method: "PATCH", body: JSON.stringify(body) },
  );
  return asJson<RegionNodeResponse>(res);
}

export async function deleteRegionNode(
  getToken: TokenGetter,
  tripId: string,
  regionNodeId: string,
): Promise<void> {
  const res = await authedFetch(
    `/v1/trips/${tripId}/timeline/regions/${regionNodeId}`,
    getToken,
    { method: "DELETE" },
  );
  await asJson<void>(res);
}

// ---------- Selected locations ----------

export interface SelectedLocationCreateRequest {
  location_id: string;
  visit_date?: string;
  visit_time?: string;
  duration_scheduled?: number;
}

export interface SelectedLocationResponse {
  id: string;
  region_node_id: string;
  location_id: string;
  location_name?: string | null;
  category?: string | null;
  visit_date?: string | null;
  visit_time?: string | null;
  duration_scheduled?: number | null;
  added_at: string;
}

const slBase = (tripId: string, regionNodeId: string) =>
  `/v1/trips/${tripId}/timeline/regions/${regionNodeId}/locations/selected`;

export async function listSelectedLocations(
  getToken: TokenGetter,
  tripId: string,
  regionNodeId: string,
): Promise<SelectedLocationResponse[]> {
  const res = await authedFetch(slBase(tripId, regionNodeId), getToken);
  return asJson<SelectedLocationResponse[]>(res);
}

export async function addSelectedLocation(
  getToken: TokenGetter,
  tripId: string,
  regionNodeId: string,
  body: SelectedLocationCreateRequest,
): Promise<SelectedLocationResponse> {
  const res = await authedFetch(slBase(tripId, regionNodeId), getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<SelectedLocationResponse>(res);
}

export async function removeSelectedLocation(
  getToken: TokenGetter,
  tripId: string,
  regionNodeId: string,
  locationId: string,
): Promise<void> {
  const res = await authedFetch(`${slBase(tripId, regionNodeId)}/${locationId}`, getToken, {
    method: "DELETE",
  });
  await asJson<void>(res);
}

// ---------- Alerts ----------

export interface TripAlertCreateRequest {
  title: string;
  description?: string;
  alert_type: string;
  severity: string;
  affected_region_id: string;
  delay_minutes?: number;
  source?: string;
}

export interface TripAlertResponse {
  id: string;
  trip_id: string;
  title: string;
  description?: string | null;
  alert_type: string;
  severity: string;
  affected_region_id: string;
  status: string;
  delay_minutes?: number | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export async function listAlerts(
  getToken: TokenGetter,
  tripId: string,
  status?: string,
): Promise<TripAlertResponse[]> {
  const res = await authedFetch(`/v1/trips/${tripId}/alerts${qs({ status })}`, getToken);
  return asJson<TripAlertResponse[]>(res);
}

export async function createAlert(
  getToken: TokenGetter,
  tripId: string,
  body: TripAlertCreateRequest,
): Promise<TripAlertResponse> {
  const res = await authedFetch(`/v1/trips/${tripId}/alerts`, getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<TripAlertResponse>(res);
}

export async function updateAlertStatus(
  getToken: TokenGetter,
  tripId: string,
  alertId: string,
  status: string,
): Promise<TripAlertResponse> {
  const res = await authedFetch(`/v1/trips/${tripId}/alerts/${alertId}/status`, getToken, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return asJson<TripAlertResponse>(res);
}
