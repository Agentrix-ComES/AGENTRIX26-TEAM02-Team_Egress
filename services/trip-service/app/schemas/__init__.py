"""Pydantic v2 schemas for the Trip Service (mirrors openapi.yaml)."""
from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# Trips
# ---------------------------------------------------------------------------


class TripCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    destination: str
    start_date: datetime
    end_date: datetime
    budget: float
    currency: str = "USD"
    travel_style: str | None = None
    dietary_preferences: list[str] = Field(default_factory=list)
    accessibility_requirements: list[str] = Field(default_factory=list)
    preferences: dict = Field(default_factory=dict)


class TripUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    budget: float | None = None
    travel_style: str | None = None
    dietary_preferences: list[str] | None = None
    accessibility_requirements: list[str] | None = None
    preferences: dict | None = None


class TripResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None = None
    destination: str
    status: str
    start_date: datetime
    end_date: datetime
    budget: float | None = None
    currency: str
    travel_style: str | None = None
    dietary_preferences: list[str] = Field(default_factory=list)
    accessibility_requirements: list[str] = Field(default_factory=list)
    preferences: dict = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
    user_id: UUID


class TimelineSummaryRegion(BaseModel):
    id: UUID
    name: str
    start_date: datetime
    end_date: datetime


class TimelineSummary(BaseModel):
    total_regions: int
    regions: list[TimelineSummaryRegion] = Field(default_factory=list)


class TripDetailResponse(TripResponse):
    timeline_summary: TimelineSummary | None = None


class TripListResponse(BaseModel):
    items: list[TripResponse]
    total: int


# ---------------------------------------------------------------------------
# Region nodes / timeline
# ---------------------------------------------------------------------------


class RegionNodeCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    region_id: UUID | None = None
    description: str | None = None
    start_date: datetime
    end_date: datetime
    latitude: float | None = None
    longitude: float | None = None
    notes: str | None = None


class RegionNodeUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    notes: str | None = None


class RegionNodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    trip_id: UUID
    region_id: UUID | None = None
    name: str
    description: str | None = None
    start_date: datetime
    end_date: datetime
    latitude: float | None = None
    longitude: float | None = None
    state: str
    sequence: int
    created_at: datetime
    updated_at: datetime


class BookingSummary(BaseModel):
    transport_bookings: int = 0
    hotel_booked: bool = False
    dining_reservations: int = 0


class RegionNodeDetailResponse(RegionNodeResponse):
    selected_locations_count: int = 0
    booking_summary: BookingSummary = Field(default_factory=BookingSummary)
    state_reason: str | None = None


class TimelineResponse(BaseModel):
    trip_id: UUID
    regions: list[RegionNodeResponse]
    summary: dict


# ---------------------------------------------------------------------------
# Selected locations
# ---------------------------------------------------------------------------


class SelectedLocationCreateRequest(BaseModel):
    location_id: str
    visit_date: date | None = None
    visit_time: str | None = None
    duration_scheduled: int | None = None


class SelectedLocationUpdateRequest(BaseModel):
    visit_date: date | None = None
    visit_time: str | None = None
    duration_scheduled: int | None = None


class SelectedLocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    region_node_id: UUID
    location_id: str
    location_name: str | None = None
    category: str | None = None
    visit_date: date | None = None
    visit_time: str | None = None
    duration_scheduled: int | None = None
    added_at: datetime


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------


class TripAlertCreateRequest(BaseModel):
    title: str = Field(min_length=3)
    description: str | None = None
    alert_type: str
    severity: str
    affected_region_id: UUID
    delay_minutes: int | None = None
    source: str = "user_report"


class TripAlertStatusUpdateRequest(BaseModel):
    status: str


class TripAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    trip_id: UUID
    title: str
    description: str | None = None
    alert_type: str
    severity: str
    affected_region_id: UUID
    status: str
    delay_minutes: int | None = None
    source: str
    created_at: datetime
    updated_at: datetime


class TripAlertDetailedResponse(TripAlertResponse):
    affected_region: RegionNodeResponse | None = None
    downstream_impacts: list[dict] = Field(default_factory=list)
    resolution_notes: str | None = None


class DisruptionPropagationRequest(BaseModel):
    affected_region_id: UUID
    estimated_delay_minutes: int


class DisruptionPropagationResponse(BaseModel):
    alert_id: UUID
    primary_affected_region: str | None = None
    propagation_analysis: list[dict] = Field(default_factory=list)
    summary: dict = Field(default_factory=dict)
