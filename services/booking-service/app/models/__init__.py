"""ORM models for the Booking Service.

Bookings are first-class top-level resources. They carry ``trip_id`` and
``region_node_id`` to link back to the Trip Service itinerary, and
``dining_option_id`` to reference the Destination Service catalog.
"""
import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TransportMode(str, enum.Enum):
    flight = "flight"
    train = "train"
    bus = "bus"
    car = "car"
    tuk_tuk = "tuk-tuk"
    walking = "walking"
    ferry = "ferry"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"


class TransportBooking(Base):
    __tablename__ = "transport_bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    trip_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    region_node_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    mode: Mapped[TransportMode] = mapped_column(
        Enum(TransportMode, name="transport_mode")
    )
    departure_location: Mapped[str] = mapped_column(String(200))
    arrival_location: Mapped[str] = mapped_column(String(200))
    departure_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    arrival_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    distance_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    provider: Mapped[str | None] = mapped_column(String(200), nullable=True)
    booking_reference: Mapped[str | None] = mapped_column(
        String(64), nullable=True
    )
    booking_status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="transport_booking_status"),
        default=BookingStatus.pending,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class HotelBooking(Base):
    __tablename__ = "hotel_bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    trip_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    region_node_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), index=True
    )
    hotel_id: Mapped[str] = mapped_column(String(128))
    hotel_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    room_type: Mapped[str] = mapped_column(String(120))
    check_in_date: Mapped[date] = mapped_column(Date)
    check_out_date: Mapped[date] = mapped_column(Date)
    nights: Mapped[int | None] = mapped_column(Integer, nullable=True)
    guests: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    booking_reference: Mapped[str | None] = mapped_column(
        String(64), nullable=True
    )
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="hotel_booking_status"),
        default=BookingStatus.pending,
    )
    confirmation_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    cancellation_policy: Mapped[str | None] = mapped_column(Text, nullable=True)
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    booked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class DiningReservation(Base):
    __tablename__ = "dining_reservations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    trip_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    region_node_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )
    # References a dining catalog item in the Destination Service.
    dining_option_id: Mapped[str] = mapped_column(String(128), index=True)
    dining_option_name: Mapped[str | None] = mapped_column(
        String(200), nullable=True
    )
    date: Mapped[date] = mapped_column(Date)
    time: Mapped[str] = mapped_column(String(16))
    party_size: Mapped[int] = mapped_column(Integer)
    reservation_reference: Mapped[str | None] = mapped_column(
        String(64), nullable=True
    )
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="dining_reservation_status"),
        default=BookingStatus.pending,
    )
    estimated_wait_time: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    contact_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
