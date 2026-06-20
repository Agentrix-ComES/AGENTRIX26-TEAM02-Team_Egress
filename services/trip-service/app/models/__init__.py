"""ORM models for the Trip Service."""
import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
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


class TripStatus(str, enum.Enum):
    planning = "planning"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class RegionState(str, enum.Enum):
    green = "green"
    red = "red"
    purple = "purple"


class AlertType(str, enum.Enum):
    delay = "delay"
    closure = "closure"
    weather = "weather"
    strike = "strike"
    accident = "accident"
    other = "other"


class AlertSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AlertStatus(str, enum.Enum):
    active = "active"
    resolved = "resolved"
    acknowledged = "acknowledged"


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    destination: Mapped[str] = mapped_column(String(200))
    status: Mapped[TripStatus] = mapped_column(
        Enum(TripStatus, name="trip_status"), default=TripStatus.planning
    )
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    travel_style: Mapped[str | None] = mapped_column(String(32), nullable=True)
    dietary_preferences: Mapped[list | None] = mapped_column(JSONB, default=list)
    accessibility_requirements: Mapped[list | None] = mapped_column(
        JSONB, default=list
    )
    preferences: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    regions: Mapped[list["RegionNode"]] = relationship(
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="RegionNode.sequence",
    )
    alerts: Mapped[list["TripAlert"]] = relationship(
        back_populates="trip", cascade="all, delete-orphan"
    )


class RegionNode(Base):
    __tablename__ = "region_nodes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("trips.id", ondelete="CASCADE"), index=True
    )
    # Reference to the destination catalog (Destination Service).
    region_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    state: Mapped[RegionState] = mapped_column(
        Enum(RegionState, name="region_state"), default=RegionState.green
    )
    state_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    sequence: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    trip: Mapped["Trip"] = relationship(back_populates="regions")
    selected_locations: Mapped[list["SelectedLocation"]] = relationship(
        back_populates="region_node", cascade="all, delete-orphan"
    )


class SelectedLocation(Base):
    __tablename__ = "selected_locations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    region_node_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("region_nodes.id", ondelete="CASCADE"),
        index=True,
    )
    # Reference to a catalog location in the Destination Service.
    location_id: Mapped[str] = mapped_column(String(128), index=True)
    location_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    category: Mapped[str | None] = mapped_column(String(64), nullable=True)
    visit_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    visit_time: Mapped[str | None] = mapped_column(String(64), nullable=True)
    duration_scheduled: Mapped[int | None] = mapped_column(Integer, nullable=True)
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    region_node: Mapped["RegionNode"] = relationship(
        back_populates="selected_locations"
    )


class TripAlert(Base):
    __tablename__ = "trip_alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("trips.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    alert_type: Mapped[AlertType] = mapped_column(Enum(AlertType, name="alert_type"))
    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity, name="alert_severity")
    )
    affected_region_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus, name="alert_status"), default=AlertStatus.active
    )
    delay_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String(32), default="user_report")
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    trip: Mapped["Trip"] = relationship(back_populates="alerts")
