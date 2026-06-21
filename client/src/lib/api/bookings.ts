import { authedFetch, asJson, qs, type TokenGetter } from "./core";

// ---------- Transport bookings ----------

export interface TransportBookingCreateRequest {
  trip_id: string;
  region_node_id: string;
  title: string;
  mode: string;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes?: number;
  distance_km?: number;
  estimated_cost?: number;
  currency?: string;
  provider?: string;
  booking_reference?: string;
  booking_status?: string;
  notes?: string;
}

export interface TransportBookingResponse {
  id: string;
  trip_id: string;
  region_node_id: string;
  title: string;
  mode: string;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes?: number | null;
  distance_km?: number | null;
  estimated_cost?: number | null;
  currency: string;
  provider?: string | null;
  booking_reference?: string | null;
  booking_status: string;
  created_at: string;
  updated_at: string;
}

export async function listTransportBookings(
  getToken: TokenGetter,
  params: { trip_id: string; region_node_id?: string; booking_status?: string },
): Promise<TransportBookingResponse[]> {
  const res = await authedFetch(`/v1/transport-bookings${qs(params)}`, getToken);
  return asJson<TransportBookingResponse[]>(res);
}

export async function createTransportBooking(
  getToken: TokenGetter,
  body: TransportBookingCreateRequest,
): Promise<TransportBookingResponse> {
  const res = await authedFetch("/v1/transport-bookings", getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<TransportBookingResponse>(res);
}

export async function deleteTransportBooking(
  getToken: TokenGetter,
  bookingId: string,
): Promise<void> {
  const res = await authedFetch(`/v1/transport-bookings/${bookingId}`, getToken, {
    method: "DELETE",
  });
  await asJson<void>(res);
}

// ---------- Hotels ----------

export interface HotelSearchRequest {
  region_id: string;
  check_in_date: string;
  check_out_date: string;
  guests?: number;
  rooms?: number;
  max_price_per_night?: number;
  amenities?: string[];
  min_rating?: number;
}

export interface HotelListing {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number | null;
  review_count?: number | null;
  price_per_night?: number | null;
  currency: string;
  room_types: { type: string; available: boolean; price?: number | null }[];
  amenities: string[];
  website?: string | null;
  phone?: string | null;
}

export interface HotelSearchResponse {
  hotels: HotelListing[];
  recommendations: { hotel_id: string; reason: string }[];
}

export async function searchHotels(
  getToken: TokenGetter,
  body: HotelSearchRequest,
): Promise<HotelSearchResponse> {
  const res = await authedFetch("/v1/hotels/search", getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<HotelSearchResponse>(res);
}

export interface HotelBookingRequest {
  trip_id: string;
  region_node_id: string;
  hotel_id: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  guests?: number;
  rooms?: number;
  special_requests?: string;
}

export interface HotelBookingResponse {
  id: string;
  trip_id: string;
  region_node_id: string;
  hotel_name?: string | null;
  hotel_id: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  nights?: number | null;
  guests?: number | null;
  rooms?: number | null;
  total_price?: number | null;
  currency: string;
  booking_reference?: string | null;
  status: string;
  special_requests?: string | null;
  booked_at: string;
}

export async function listHotelBookings(
  getToken: TokenGetter,
  params: { trip_id: string; region_node_id?: string; status?: string },
): Promise<HotelBookingResponse[]> {
  const res = await authedFetch(`/v1/hotel-bookings${qs(params)}`, getToken);
  return asJson<HotelBookingResponse[]>(res);
}

export async function createHotelBooking(
  getToken: TokenGetter,
  body: HotelBookingRequest,
): Promise<HotelBookingResponse> {
  const res = await authedFetch("/v1/hotel-bookings", getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<HotelBookingResponse>(res);
}

export async function deleteHotelBooking(
  getToken: TokenGetter,
  bookingId: string,
): Promise<void> {
  const res = await authedFetch(`/v1/hotel-bookings/${bookingId}`, getToken, {
    method: "DELETE",
  });
  await asJson<void>(res);
}

// ---------- Dining reservations ----------

export interface DiningReservationRequest {
  trip_id: string;
  region_node_id?: string;
  dining_option_id: string;
  date: string;
  time: string;
  party_size: number;
  special_requests?: string;
  name?: string;
  phone?: string;
}

export interface DiningReservationResponse {
  id: string;
  trip_id: string;
  region_node_id?: string | null;
  dining_option_id: string;
  dining_option_name?: string | null;
  date: string;
  time: string;
  party_size: number;
  reservation_reference?: string | null;
  status: string;
  estimated_wait_time?: number | null;
  contact_number?: string | null;
  created_at: string;
}

export async function listDiningReservations(
  getToken: TokenGetter,
  params: { trip_id: string; region_node_id?: string; status?: string },
): Promise<DiningReservationResponse[]> {
  const res = await authedFetch(`/v1/dining-reservations${qs(params)}`, getToken);
  return asJson<DiningReservationResponse[]>(res);
}

export async function createDiningReservation(
  getToken: TokenGetter,
  body: DiningReservationRequest,
): Promise<DiningReservationResponse> {
  const res = await authedFetch("/v1/dining-reservations", getToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return asJson<DiningReservationResponse>(res);
}

export async function deleteDiningReservation(
  getToken: TokenGetter,
  reservationId: string,
): Promise<void> {
  const res = await authedFetch(`/v1/dining-reservations/${reservationId}`, getToken, {
    method: "DELETE",
  });
  await asJson<void>(res);
}
