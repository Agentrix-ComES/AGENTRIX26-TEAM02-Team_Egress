"""Pydantic v2 schemas for the Booking Service (mirrors openapi.yaml)."""
from __future__ import annotations

import datetime as _dt
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# Transport bookings
# ---------------------------------------------------------------------------


class TransportBookingCreateRequest(BaseModel):
    trip_id: UUID
    region_node_id: UUID
    title: str
    mode: str
    departure_location: str
    arrival_location: str
    departure_time: datetime
    arrival_time: datetime
    duration_minutes: int | None = None
    distance_km: float | None = None
    estimated_cost: float | None = None
    currency: str = "USD"
    provider: str | None = None
    booking_reference: str | None = None
    booking_status: str = "pending"
    notes: str | None = None


class TransportBookingUpdateRequest(BaseModel):
    title: str | None = None
    departure_time: datetime | None = None
    arrival_time: datetime | None = None
    estimated_cost: float | None = None
    booking_reference: str | None = None
    booking_status: str | None = None
    notes: str | None = None


class TransportBookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    trip_id: UUID
    region_node_id: UUID
    title: str
    mode: str
    departure_location: str
    arrival_location: str
    departure_time: datetime
    arrival_time: datetime
    duration_minutes: int | None = None
    distance_km: float | None = None
    estimated_cost: float | None = None
    currency: str
    provider: str | None = None
    booking_reference: str | None = None
    booking_status: str
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Hotels
# ---------------------------------------------------------------------------


class HotelSearchRequest(BaseModel):
    region_id: UUID
    check_in_date: date
    check_out_date: date
    guests: int | None = None
    rooms: int | None = None
    max_price_per_night: float | None = None
    amenities: list[str] = Field(default_factory=list)
    min_rating: float | None = Field(default=None, ge=0, le=5)


class RoomType(BaseModel):
    type: str
    available: bool = True
    price: float | None = None


class HotelListing(BaseModel):
    id: str
    name: str
    description: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    rating: float | None = None
    review_count: int | None = None
    price_per_night: float | None = None
    currency: str = "USD"
    room_types: list[RoomType] = Field(default_factory=list)
    amenities: list[str] = Field(default_factory=list)
    check_in_time: str | None = None
    check_out_time: str | None = None
    cancellation_policy: str | None = None
    website: str | None = None
    phone: str | None = None


class HotelRecommendation(BaseModel):
    hotel_id: str
    reason: str


class HotelSearchResponse(BaseModel):
    hotels: list[HotelListing] = Field(default_factory=list)
    recommendations: list[HotelRecommendation] = Field(default_factory=list)


class HotelBookingRequest(BaseModel):
    trip_id: UUID
    region_node_id: UUID
    hotel_id: str
    room_type: str
    check_in_date: date
    check_out_date: date
    guests: int | None = None
    rooms: int | None = None
    special_requests: str | None = None


class HotelBookingUpdateRequest(BaseModel):
    room_type: str | None = None
    check_in_date: date | None = None
    check_out_date: date | None = None
    guests: int | None = None
    rooms: int | None = None
    special_requests: str | None = None
    status: str | None = None


class HotelBookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    trip_id: UUID
    region_node_id: UUID
    hotel_name: str | None = None
    hotel_id: str
    room_type: str
    check_in_date: date
    check_out_date: date
    nights: int | None = None
    guests: int | None = None
    rooms: int | None = None
    total_price: float | None = None
    currency: str
    booking_reference: str | None = None
    status: str
    confirmation_sent: bool
    cancellation_policy: str | None = None
    special_requests: str | None = None
    booked_at: datetime


# ---------------------------------------------------------------------------
# Dining reservations
# ---------------------------------------------------------------------------


class DiningReservationRequest(BaseModel):
    trip_id: UUID
    region_node_id: UUID | None = None
    dining_option_id: str
    date: _dt.date
    time: str
    party_size: int
    special_requests: str | None = None
    name: str | None = None
    phone: str | None = None


class DiningReservationUpdateRequest(BaseModel):
    date: _dt.date | None = None
    time: str | None = None
    party_size: int | None = None
    special_requests: str | None = None
    status: str | None = None


class DiningReservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    trip_id: UUID
    region_node_id: UUID | None = None
    dining_option_id: str
    dining_option_name: str | None = None
    date: _dt.date
    time: str
    party_size: int
    reservation_reference: str | None = None
    status: str
    estimated_wait_time: int | None = None
    contact_number: str | None = None
    created_at: datetime
