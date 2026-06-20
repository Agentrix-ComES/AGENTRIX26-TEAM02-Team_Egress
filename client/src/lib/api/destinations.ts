import { authedFetch, asJson, qs, type TokenGetter } from "./core";

// ---------- Regions ----------

export interface RegionCreateRequest {
  name: string;
  country: string;
  description?: string;
  region_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface RegionResponse {
  id: string;
  name: string;
  country: string;
  description?: string | null;
  region_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogCounts {
  locations: number;
  activities: number;
  dining_options: number;
  emergency_services: number;
  offers: number;
  cultural_context_available: boolean;
}

export interface RegionDetailResponse extends RegionResponse {
  catalog_counts: CatalogCounts;
}

export interface RegionListResponse {
  items: RegionResponse[];
  total: number;
}

export async function listRegions(
  getToken: TokenGetter,
  params: { country?: string; search?: string; skip?: number; limit?: number } = {},
): Promise<RegionListResponse> {
  const res = await authedFetch(`/api/v1/regions${qs(params)}`, getToken);
  return asJson<RegionListResponse>(res);
}

export async function getRegion(
  getToken: TokenGetter,
  regionId: string,
): Promise<RegionDetailResponse> {
  const res = await authedFetch(`/api/v1/regions/${regionId}`, getToken);
  return asJson<RegionDetailResponse>(res);
}

export async function createRegion(
  getToken: TokenGetter,
  body: RegionCreateRequest,
): Promise<RegionResponse> {
  const res = await authedFetch("/api/v1/regions", getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<RegionResponse>(res);
}

export async function deleteRegion(getToken: TokenGetter, regionId: string): Promise<void> {
  const res = await authedFetch(`/api/v1/regions/${regionId}`, getToken, { method: "DELETE" });
  await asJson<void>(res);
}

// ---------- Visitable locations ----------

export interface VisitableLocationCreateRequest {
  name: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  entry_fee?: number;
  estimated_duration_minutes?: number;
  opening_hours?: string;
  best_time_to_visit?: string;
  difficulty_level?: string;
  accessibility_info?: string;
  guided_tour_available?: boolean;
  images?: string[];
  cultural_context_short?: string;
}

export interface VisitableLocationResponse {
  id: string;
  region_id: string;
  name: string;
  description?: string | null;
  category: string;
  location: { latitude?: number | null; longitude?: number | null; address?: string | null };
  rating?: number | null;
  review_count?: number | null;
  entry_fee?: number | null;
  estimated_duration_minutes?: number | null;
  opening_hours?: string | null;
  best_time_to_visit?: string | null;
  difficulty_level?: string | null;
  images: string[];
}

export interface VisitableLocationListResponse {
  items: VisitableLocationResponse[];
  total: number;
}

export async function listLocations(
  getToken: TokenGetter,
  regionId: string,
  params: { category?: string; skip?: number; limit?: number } = {},
): Promise<VisitableLocationListResponse> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/locations${qs(params)}`, getToken);
  return asJson<VisitableLocationListResponse>(res);
}

export async function createLocation(
  getToken: TokenGetter,
  regionId: string,
  body: VisitableLocationCreateRequest,
): Promise<VisitableLocationResponse> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/locations`, getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<VisitableLocationResponse>(res);
}

export async function deleteLocation(
  getToken: TokenGetter,
  regionId: string,
  locationId: string,
): Promise<void> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/locations/${locationId}`, getToken, {
    method: "DELETE",
  });
  await asJson<void>(res);
}

// ---------- Activities ----------

export interface ActivityCreateRequest {
  name: string;
  description?: string;
  category: string;
  difficulty_level: string;
  duration_hours?: number;
  estimated_cost?: number;
  physical_requirements?: string;
  location?: string;
  operating_hours?: string;
  best_season?: string;
  required_equipment?: string[];
  instructor_available?: boolean;
  group_size_limit?: number;
  images?: string[];
  provider?: string;
}

export interface ActivityResponse {
  id: string;
  region_id: string;
  name: string;
  description?: string | null;
  category: string;
  difficulty_level: string;
  duration_hours?: number | null;
  estimated_cost?: number | null;
  location?: string | null;
  operating_hours?: string | null;
  best_season?: string | null;
  provider?: string | null;
  images: string[];
}

export async function listActivities(
  getToken: TokenGetter,
  regionId: string,
  params: { difficulty?: string } = {},
): Promise<ActivityResponse[]> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/activities${qs(params)}`, getToken);
  return asJson<ActivityResponse[]>(res);
}

export async function createActivity(
  getToken: TokenGetter,
  regionId: string,
  body: ActivityCreateRequest,
): Promise<ActivityResponse> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/activities`, getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<ActivityResponse>(res);
}

export async function deleteActivity(
  getToken: TokenGetter,
  regionId: string,
  activityId: string,
): Promise<void> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/activities/${activityId}`, getToken, {
    method: "DELETE",
  });
  await asJson<void>(res);
}

// ---------- Dining options (catalog) ----------

export interface DiningOptionCreateRequest {
  name: string;
  type: string;
  cuisine?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  average_cost_per_person?: number;
  operating_hours?: string;
  dietary_accommodations?: string[];
  specialties?: string[];
  reservation_required?: boolean;
  phone?: string;
  website?: string;
  images?: string[];
}

export interface DiningOptionResponse {
  id: string;
  region_id: string;
  name: string;
  type: string;
  cuisine?: string | null;
  location: { address?: string | null; latitude?: number | null; longitude?: number | null };
  rating?: number | null;
  review_count?: number | null;
  average_cost_per_person?: number | null;
  operating_hours?: string | null;
  dietary_accommodations: string[];
  specialties: string[];
  reservation_required?: boolean | null;
  phone?: string | null;
  website?: string | null;
  images: string[];
}

export async function listDiningOptions(
  getToken: TokenGetter,
  regionId: string,
  params: { cuisine?: string; dietary_filter?: string } = {},
): Promise<DiningOptionResponse[]> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/dining${qs(params)}`, getToken);
  return asJson<DiningOptionResponse[]>(res);
}

export async function createDiningOption(
  getToken: TokenGetter,
  regionId: string,
  body: DiningOptionCreateRequest,
): Promise<DiningOptionResponse> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/dining`, getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<DiningOptionResponse>(res);
}

export async function deleteDiningOption(
  getToken: TokenGetter,
  regionId: string,
  diningId: string,
): Promise<void> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/dining/${diningId}`, getToken, {
    method: "DELETE",
  });
  await asJson<void>(res);
}

// ---------- Emergency services ----------

export interface EmergencyServiceCreateRequest {
  service_type: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  emergency_phone?: string;
  website?: string;
  specialties?: string[];
  availability?: string;
  additional_info?: Record<string, unknown>;
}

export interface EmergencyServiceResponse {
  id: string;
  region_id: string;
  service_type: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  emergency_phone?: string | null;
  website?: string | null;
  additional_info: Record<string, unknown>;
}

export interface EmergencyServicesResponse {
  region_name: string;
  hospitals: { id?: string | null; name?: string | null; phone?: string | null }[];
  clinics: { id?: string | null; name?: string | null }[];
  emergency_contacts: { service_type?: string | null; name?: string | null; phone?: string | null }[];
  emergency_helpline?: string | null;
}

export async function getEmergencyServices(
  getToken: TokenGetter,
  regionId: string,
): Promise<EmergencyServicesResponse> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/emergency`, getToken);
  return asJson<EmergencyServicesResponse>(res);
}

export async function createEmergencyService(
  getToken: TokenGetter,
  regionId: string,
  body: EmergencyServiceCreateRequest,
): Promise<EmergencyServiceResponse> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/emergency`, getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<EmergencyServiceResponse>(res);
}

export async function deleteEmergencyService(
  getToken: TokenGetter,
  regionId: string,
  serviceId: string,
): Promise<void> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/emergency/${serviceId}`, getToken, {
    method: "DELETE",
  });
  await asJson<void>(res);
}

// ---------- Offers ----------

export interface OfferCreateRequest {
  title: string;
  description?: string;
  category: string;
  discount_type: string;
  discount_value: number;
  original_price?: number;
  discounted_price?: number;
  provider?: string;
  valid_from: string;
  valid_until: string;
  terms_and_conditions?: string;
  code?: string;
}

export interface OfferResponse {
  id: string;
  region_id: string;
  title: string;
  description?: string | null;
  category: string;
  discount_type: string;
  discount_value: number;
  original_price?: number | null;
  discounted_price?: number | null;
  provider?: string | null;
  valid_from: string;
  valid_until: string;
  code?: string | null;
}

export async function listOffers(
  getToken: TokenGetter,
  regionId: string,
  params: { category?: string } = {},
): Promise<OfferResponse[]> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/offers${qs(params)}`, getToken);
  return asJson<OfferResponse[]>(res);
}

export async function createOffer(
  getToken: TokenGetter,
  regionId: string,
  body: OfferCreateRequest,
): Promise<OfferResponse> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/offers`, getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<OfferResponse>(res);
}

export async function deleteOffer(
  getToken: TokenGetter,
  regionId: string,
  offerId: string,
): Promise<void> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/offers/${offerId}`, getToken, {
    method: "DELETE",
  });
  await asJson<void>(res);
}

// ---------- Cultural context ----------

export interface CulturalContextResponse {
  region_name: string;
  general_context: {
    history?: string | null;
    religion_predominant?: string | null;
    language?: string | null;
    local_customs: string[];
    dress_code_general?: string | null;
    photography_etiquette?: string | null;
  } | null;
  locations_context: {
    location_id?: string | null;
    location_name?: string | null;
    significance?: string | null;
    dress_code?: string | null;
  }[];
  regional_festivals_events: { name?: string | null; description?: string | null; date?: string | null }[];
  local_customs_summary?: string | null;
}

export async function getCulturalContext(
  getToken: TokenGetter,
  regionId: string,
): Promise<CulturalContextResponse> {
  const res = await authedFetch(`/api/v1/regions/${regionId}/culture`, getToken);
  return asJson<CulturalContextResponse>(res);
}
