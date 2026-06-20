"""ORM models for the Destination Service catalog.

All catalog entities are keyed by ``region_id`` (a destination), not by trip.
Nested/object fields use JSONB to keep the relational surface compact while
matching the OpenAPI schema shapes.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class LocationCategory(str, enum.Enum):
    cultural = "cultural"
    historical = "historical"
    adventure = "adventure"
    relaxation = "relaxation"
    food = "food"
    nature = "nature"
    religious = "religious"


class Difficulty(str, enum.Enum):
    easy = "easy"
    moderate = "moderate"
    difficult = "difficult"


class DiningType(str, enum.Enum):
    restaurant = "restaurant"
    cafe = "cafe"
    food_shop = "food_shop"
    street_food = "street_food"
    bakery = "bakery"


class EmergencyServiceType(str, enum.Enum):
    hospital = "hospital"
    clinic = "clinic"
    emergency_contact = "emergency_contact"
    police = "police"
    fire = "fire"
    embassy = "embassy"


class OfferCategory(str, enum.Enum):
    activity = "activity"
    dining = "dining"
    accommodation = "accommodation"
    transport = "transport"
    shopping = "shopping"
    wellness = "wellness"


class DiscountType(str, enum.Enum):
    percentage = "percentage"
    fixed_amount = "fixed_amount"
    buy_one_get_one = "buy_one_get_one"
    voucher = "voucher"


class Region(Base):
    __tablename__ = "regions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), index=True)
    country: Mapped[str] = mapped_column(String(120), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    region_code: Mapped[str | None] = mapped_column(String(32), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    locations: Mapped[list["VisitableLocation"]] = relationship(
        back_populates="region", cascade="all, delete-orphan"
    )
    activities: Mapped[list["Activity"]] = relationship(
        back_populates="region", cascade="all, delete-orphan"
    )
    dining_options: Mapped[list["DiningOption"]] = relationship(
        back_populates="region", cascade="all, delete-orphan"
    )
    emergency_services: Mapped[list["EmergencyService"]] = relationship(
        back_populates="region", cascade="all, delete-orphan"
    )
    offers: Mapped[list["Offer"]] = relationship(
        back_populates="region", cascade="all, delete-orphan"
    )
    cultural_context: Mapped["RegionCulturalContext"] = relationship(
        back_populates="region",
        cascade="all, delete-orphan",
        uselist=False,
    )
    location_cultural_contexts: Mapped[list["LocationCulturalContext"]] = (
        relationship(back_populates="region", cascade="all, delete-orphan")
    )


class VisitableLocation(Base):
    __tablename__ = "visitable_locations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("regions.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[LocationCategory] = mapped_column(
        Enum(LocationCategory, name="location_category")
    )
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    review_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    entry_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_duration_minutes: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    opening_hours: Mapped[str | None] = mapped_column(String(200), nullable=True)
    best_time_to_visit: Mapped[str | None] = mapped_column(
        String(200), nullable=True
    )
    difficulty_level: Mapped[Difficulty | None] = mapped_column(
        Enum(Difficulty, name="difficulty_level"), nullable=True
    )
    accessibility_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    guided_tour_available: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True
    )
    images: Mapped[list | None] = mapped_column(JSONB, default=list)
    cultural_context_short: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    region: Mapped["Region"] = relationship(back_populates="locations")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("regions.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(120))
    difficulty_level: Mapped[Difficulty] = mapped_column(
        Enum(Difficulty, name="activity_difficulty")
    )
    duration_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    age_requirements: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    physical_requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    operating_hours: Mapped[str | None] = mapped_column(String(200), nullable=True)
    best_season: Mapped[str | None] = mapped_column(String(120), nullable=True)
    required_equipment: Mapped[list | None] = mapped_column(JSONB, default=list)
    instructor_available: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True
    )
    group_size_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reviews: Mapped[float | None] = mapped_column(Float, nullable=True)
    images: Mapped[list | None] = mapped_column(JSONB, default=list)
    provider: Mapped[str | None] = mapped_column(String(200), nullable=True)

    region: Mapped["Region"] = relationship(back_populates="activities")


class DiningOption(Base):
    __tablename__ = "dining_options"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("regions.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200))
    type: Mapped[DiningType] = mapped_column(Enum(DiningType, name="dining_type"))
    cuisine: Mapped[str | None] = mapped_column(String(120), nullable=True)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    review_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    average_cost_per_person: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    operating_hours: Mapped[str | None] = mapped_column(String(200), nullable=True)
    dietary_accommodations: Mapped[list | None] = mapped_column(
        JSONB, default=list
    )
    specialties: Mapped[list | None] = mapped_column(JSONB, default=list)
    reservation_required: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True
    )
    parking_available: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    website: Mapped[str | None] = mapped_column(String(300), nullable=True)
    images: Mapped[list | None] = mapped_column(JSONB, default=list)

    region: Mapped["Region"] = relationship(back_populates="dining_options")


class EmergencyService(Base):
    __tablename__ = "emergency_services"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("regions.id", ondelete="CASCADE"),
        index=True,
    )
    service_type: Mapped[EmergencyServiceType] = mapped_column(
        Enum(EmergencyServiceType, name="emergency_service_type")
    )
    name: Mapped[str] = mapped_column(String(200))
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    emergency_phone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    website: Mapped[str | None] = mapped_column(String(300), nullable=True)
    specialties: Mapped[list | None] = mapped_column(JSONB, default=list)
    availability: Mapped[str | None] = mapped_column(String(32), nullable=True)
    additional_info: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    region: Mapped["Region"] = relationship(back_populates="emergency_services")


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("regions.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[OfferCategory] = mapped_column(
        Enum(OfferCategory, name="offer_category")
    )
    discount_type: Mapped[DiscountType] = mapped_column(
        Enum(DiscountType, name="discount_type")
    )
    discount_value: Mapped[float] = mapped_column(Float)
    original_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    discounted_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    provider: Mapped[str | None] = mapped_column(String(200), nullable=True)
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    terms_and_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    code: Mapped[str | None] = mapped_column(String(64), nullable=True)

    region: Mapped["Region"] = relationship(back_populates="offers")


class RegionCulturalContext(Base):
    """General, region-wide cultural guidance (one row per region)."""

    __tablename__ = "region_cultural_contexts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("regions.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )
    history: Mapped[str | None] = mapped_column(Text, nullable=True)
    religion_predominant: Mapped[str | None] = mapped_column(
        String(120), nullable=True
    )
    language: Mapped[str | None] = mapped_column(String(120), nullable=True)
    local_customs: Mapped[list | None] = mapped_column(JSONB, default=list)
    dress_code_general: Mapped[str | None] = mapped_column(Text, nullable=True)
    photography_etiquette: Mapped[str | None] = mapped_column(Text, nullable=True)
    greetings_customs: Mapped[str | None] = mapped_column(Text, nullable=True)
    dining_etiquette: Mapped[str | None] = mapped_column(Text, nullable=True)
    tips_and_gratuity: Mapped[str | None] = mapped_column(Text, nullable=True)
    business_hours_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    local_customs_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    regional_festivals_events: Mapped[list | None] = mapped_column(
        JSONB, default=list
    )

    region: Mapped["Region"] = relationship(back_populates="cultural_context")


class LocationCulturalContext(Base):
    """Location-specific etiquette tied to a visitable location."""

    __tablename__ = "location_cultural_contexts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    region_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("regions.id", ondelete="CASCADE"),
        index=True,
    )
    location_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), index=True
    )
    location_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    significance: Mapped[str | None] = mapped_column(Text, nullable=True)
    dress_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    photography_allowed: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True
    )
    photography_restrictions: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    behavioral_expectations: Mapped[list | None] = mapped_column(
        JSONB, default=list
    )
    visiting_hours: Mapped[str | None] = mapped_column(String(200), nullable=True)
    important_dates_restricted: Mapped[list | None] = mapped_column(
        JSONB, default=list
    )
    guides_available: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    entry_rituals_if_any: Mapped[str | None] = mapped_column(Text, nullable=True)
    tips: Mapped[list | None] = mapped_column(JSONB, default=list)

    region: Mapped["Region"] = relationship(
        back_populates="location_cultural_contexts"
    )
