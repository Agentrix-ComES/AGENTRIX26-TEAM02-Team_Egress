"""Pydantic v2 schemas for the Destination Service (mirrors openapi.yaml)."""
from __future__ import annotations

import datetime as _dt
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# Regions
# ---------------------------------------------------------------------------


class RegionCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    country: str
    description: str | None = None
    region_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None


class RegionUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None


class RegionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    country: str
    description: str | None = None
    region_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None
    created_at: datetime
    updated_at: datetime


class CatalogCounts(BaseModel):
    locations: int = 0
    activities: int = 0
    dining_options: int = 0
    emergency_services: int = 0
    offers: int = 0
    cultural_context_available: bool = False


class RegionDetailResponse(RegionResponse):
    catalog_counts: CatalogCounts = Field(default_factory=CatalogCounts)


class RegionListResponse(BaseModel):
    items: list[RegionResponse]
    total: int


# ---------------------------------------------------------------------------
# Visitable locations
# ---------------------------------------------------------------------------


class GeoLocation(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    address: str | None = None


class VisitableLocationCreateRequest(BaseModel):
    name: str = Field(min_length=3)
    description: str | None = None
    category: str
    latitude: float
    longitude: float
    address: str
    entry_fee: float | None = None
    estimated_duration_minutes: int | None = None
    opening_hours: str | None = None
    best_time_to_visit: str | None = None
    difficulty_level: str | None = None
    accessibility_info: str | None = None
    guided_tour_available: bool | None = None
    images: list[str] = Field(default_factory=list)
    cultural_context_short: str | None = None


class VisitableLocationUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    address: str | None = None
    entry_fee: float | None = None
    estimated_duration_minutes: int | None = None
    opening_hours: str | None = None
    best_time_to_visit: str | None = None
    difficulty_level: str | None = None
    accessibility_info: str | None = None
    guided_tour_available: bool | None = None
    images: list[str] | None = None
    cultural_context_short: str | None = None


class VisitableLocationResponse(BaseModel):
    id: UUID
    region_id: UUID
    name: str
    description: str | None = None
    category: str
    location: GeoLocation
    rating: float | None = None
    review_count: int | None = None
    entry_fee: float | None = None
    estimated_duration_minutes: int | None = None
    opening_hours: str | None = None
    best_time_to_visit: str | None = None
    difficulty_level: str | None = None
    accessibility_info: str | None = None
    guided_tour_available: bool | None = None
    images: list[str] = Field(default_factory=list)
    cultural_context_short: str | None = None


class VisitableLocationListResponse(BaseModel):
    items: list[VisitableLocationResponse]
    total: int


# ---------------------------------------------------------------------------
# Activities
# ---------------------------------------------------------------------------


class AgeRequirements(BaseModel):
    minimum_age: int | None = None
    maximum_age: int | None = None


class ActivityCreateRequest(BaseModel):
    name: str = Field(min_length=3)
    description: str | None = None
    category: str
    difficulty_level: str
    duration_hours: float | None = None
    estimated_cost: float | None = None
    age_requirements: AgeRequirements | None = None
    physical_requirements: str | None = None
    location: str | None = None
    operating_hours: str | None = None
    best_season: str | None = None
    required_equipment: list[str] = Field(default_factory=list)
    instructor_available: bool | None = None
    group_size_limit: int | None = None
    images: list[str] = Field(default_factory=list)
    provider: str | None = None


class ActivityUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    difficulty_level: str | None = None
    duration_hours: float | None = None
    estimated_cost: float | None = None
    physical_requirements: str | None = None
    location: str | None = None
    operating_hours: str | None = None
    best_season: str | None = None
    required_equipment: list[str] | None = None
    instructor_available: bool | None = None
    group_size_limit: int | None = None
    images: list[str] | None = None
    provider: str | None = None


class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    region_id: UUID
    name: str
    description: str | None = None
    category: str
    difficulty_level: str
    duration_hours: float | None = None
    estimated_cost: float | None = None
    age_requirements: AgeRequirements | None = None
    physical_requirements: str | None = None
    location: str | None = None
    operating_hours: str | None = None
    best_season: str | None = None
    required_equipment: list[str] = Field(default_factory=list)
    instructor_available: bool | None = None
    group_size_limit: int | None = None
    reviews: float | None = None
    images: list[str] = Field(default_factory=list)
    provider: str | None = None


# ---------------------------------------------------------------------------
# Dining options (catalog)
# ---------------------------------------------------------------------------


class DiningOptionCreateRequest(BaseModel):
    name: str = Field(min_length=3)
    type: str
    cuisine: str | None = None
    address: str
    latitude: float | None = None
    longitude: float | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    average_cost_per_person: float | None = None
    operating_hours: str | None = None
    dietary_accommodations: list[str] = Field(default_factory=list)
    specialties: list[str] = Field(default_factory=list)
    reservation_required: bool | None = None
    parking_available: bool | None = None
    phone: str | None = None
    website: str | None = None
    images: list[str] = Field(default_factory=list)


class DiningOptionUpdateRequest(BaseModel):
    name: str | None = None
    type: str | None = None
    cuisine: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    rating: float | None = None
    average_cost_per_person: float | None = None
    operating_hours: str | None = None
    dietary_accommodations: list[str] | None = None
    specialties: list[str] | None = None
    reservation_required: bool | None = None
    parking_available: bool | None = None
    phone: str | None = None
    website: str | None = None
    images: list[str] | None = None


class DiningLocation(BaseModel):
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class DiningOptionResponse(BaseModel):
    id: UUID
    region_id: UUID
    name: str
    type: str
    cuisine: str | None = None
    location: DiningLocation
    rating: float | None = None
    review_count: int | None = None
    average_cost_per_person: float | None = None
    operating_hours: str | None = None
    dietary_accommodations: list[str] = Field(default_factory=list)
    specialties: list[str] = Field(default_factory=list)
    reservation_required: bool | None = None
    parking_available: bool | None = None
    phone: str | None = None
    website: str | None = None
    images: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Emergency services
# ---------------------------------------------------------------------------


class EmergencyServiceCreateRequest(BaseModel):
    service_type: str
    name: str = Field(min_length=3)
    address: str
    latitude: float | None = None
    longitude: float | None = None
    phone: str
    emergency_phone: str | None = None
    website: str | None = None
    specialties: list[str] = Field(default_factory=list)
    availability: str | None = None
    additional_info: dict = Field(default_factory=dict)


class EmergencyServiceUpdateRequest(BaseModel):
    name: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    emergency_phone: str | None = None
    website: str | None = None
    specialties: list[str] | None = None
    availability: str | None = None
    additional_info: dict | None = None


class EmergencyServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    region_id: UUID
    service_type: str
    name: str
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    emergency_phone: str | None = None
    website: str | None = None
    additional_info: dict = Field(default_factory=dict)


class HospitalInfo(BaseModel):
    id: str | None = None
    name: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    emergency_phone: str | None = None
    website: str | None = None
    specialties: list[str] = Field(default_factory=list)
    availability: str | None = None


class ClinicInfo(BaseModel):
    id: str | None = None
    name: str | None = None
    address: str | None = None
    phone: str | None = None
    specialties: list[str] = Field(default_factory=list)
    operating_hours: str | None = None


class EmergencyContactInfo(BaseModel):
    service_type: str | None = None
    name: str | None = None
    phone: str | None = None


class PoliceStationInfo(BaseModel):
    id: str | None = None
    name: str | None = None
    address: str | None = None
    phone: str | None = None
    emergency_phone: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class FireServiceInfo(BaseModel):
    emergency_phone: str | None = None
    address: str | None = None


class EmbassyInfo(BaseModel):
    country: str | None = None
    address: str | None = None
    phone: str | None = None
    emergency_phone: str | None = None


class EmergencyServicesResponse(BaseModel):
    region_name: str
    hospitals: list[HospitalInfo] = Field(default_factory=list)
    clinics: list[ClinicInfo] = Field(default_factory=list)
    emergency_contacts: list[EmergencyContactInfo] = Field(default_factory=list)
    emergency_helpline: str | None = None
    police_station: PoliceStationInfo | None = None
    fire_service: FireServiceInfo | None = None
    nearest_embassy: EmbassyInfo | None = None


# ---------------------------------------------------------------------------
# Offers
# ---------------------------------------------------------------------------


class OfferCreateRequest(BaseModel):
    title: str = Field(min_length=3)
    description: str | None = None
    category: str
    discount_type: str
    discount_value: float
    original_price: float | None = None
    discounted_price: float | None = None
    provider: str | None = None
    valid_from: date
    valid_until: date
    terms_and_conditions: str | None = None
    code: str | None = None


class OfferUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    discount_type: str | None = None
    discount_value: float | None = None
    original_price: float | None = None
    discounted_price: float | None = None
    provider: str | None = None
    valid_from: date | None = None
    valid_until: date | None = None
    terms_and_conditions: str | None = None
    code: str | None = None


class OfferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    region_id: UUID
    title: str
    description: str | None = None
    category: str
    discount_type: str
    discount_value: float
    original_price: float | None = None
    discounted_price: float | None = None
    provider: str | None = None
    valid_from: date
    valid_until: date
    terms_and_conditions: str | None = None
    code: str | None = None


# ---------------------------------------------------------------------------
# Cultural context
# ---------------------------------------------------------------------------


class GeneralCulturalContext(BaseModel):
    history: str | None = None
    religion_predominant: str | None = None
    language: str | None = None
    local_customs: list[str] = Field(default_factory=list)
    dress_code_general: str | None = None
    photography_etiquette: str | None = None
    greetings_customs: str | None = None
    dining_etiquette: str | None = None
    tips_and_gratuity: str | None = None
    business_hours_note: str | None = None


class GeneralCulturalContextUpdateRequest(GeneralCulturalContext):
    pass


class RestrictedDate(BaseModel):
    date: _dt.date | None = None
    reason: str | None = None
    access_level: str | None = None


class LocationCulturalContext(BaseModel):
    location_id: str | None = None
    location_name: str | None = None
    significance: str | None = None
    dress_code: str | None = None
    photography_allowed: bool | None = None
    photography_restrictions: str | None = None
    behavioral_expectations: list[str] = Field(default_factory=list)
    visiting_hours: str | None = None
    important_dates_restricted: list[RestrictedDate] = Field(default_factory=list)
    guides_available: bool | None = None
    entry_rituals_if_any: str | None = None
    tips: list[str] = Field(default_factory=list)


class LocationCulturalContextCreateRequest(BaseModel):
    location_name: str
    significance: str | None = None
    dress_code: str | None = None
    photography_allowed: bool | None = None
    photography_restrictions: str | None = None
    behavioral_expectations: list[str] = Field(default_factory=list)
    visiting_hours: str | None = None
    important_dates_restricted: list[RestrictedDate] = Field(default_factory=list)
    guides_available: bool | None = None
    entry_rituals_if_any: str | None = None
    tips: list[str] = Field(default_factory=list)


class LocationCulturalContextUpdateRequest(BaseModel):
    location_name: str | None = None
    significance: str | None = None
    dress_code: str | None = None
    photography_allowed: bool | None = None
    photography_restrictions: str | None = None
    behavioral_expectations: list[str] | None = None
    visiting_hours: str | None = None
    important_dates_restricted: list[RestrictedDate] | None = None
    guides_available: bool | None = None
    entry_rituals_if_any: str | None = None
    tips: list[str] | None = None


class FestivalInfo(BaseModel):
    name: str | None = None
    description: str | None = None
    date: str | None = None


class CulturalContextResponse(BaseModel):
    region_name: str
    general_context: GeneralCulturalContext | None = None
    locations_context: list[LocationCulturalContext] = Field(default_factory=list)
    regional_festivals_events: list[FestivalInfo] = Field(default_factory=list)
    local_customs_summary: str | None = None
