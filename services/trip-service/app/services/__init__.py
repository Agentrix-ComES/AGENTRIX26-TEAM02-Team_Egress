"""Business logic for the Trip Service. Routes stay thin; logic lives here."""
from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.models import (
    AlertStatus,
    RegionNode,
    SelectedLocation,
    Trip,
    TripAlert,
)
from app.repositories import (
    RegionNodeRepository,
    SelectedLocationRepository,
    TripAlertRepository,
    TripRepository,
)


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class TripService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.trips = TripRepository(db)

    async def create_trip(
        self, payload: schemas.TripCreateRequest, user_id: UUID
    ) -> Trip:
        trip = Trip(user_id=user_id, **payload.model_dump())
        return await self.trips.create(trip)

    async def list_trips(
        self, user_id: UUID, status: str | None, skip: int, limit: int
    ) -> tuple[list[Trip], int]:
        return await self.trips.list(user_id, status, skip, limit)

    async def get_trip(self, trip_id: UUID, user_id: UUID) -> Trip:
        trip = await self.trips.get(trip_id, user_id)
        if trip is None:
            raise _not_found("Trip not found")
        return trip

    async def get_trip_detail(
        self, trip_id: UUID, user_id: UUID
    ) -> schemas.TripDetailResponse:
        trip = await self.trips.get_with_regions(trip_id, user_id)
        if trip is None:
            raise _not_found("Trip not found")
        return self.build_detail(trip)

    async def update_trip(
        self, trip_id: UUID, payload: schemas.TripUpdateRequest, user_id: UUID
    ) -> Trip:
        trip = await self.get_trip(trip_id, user_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(trip, field, value)
        await self.db.flush()
        await self.db.refresh(trip)
        return trip

    async def delete_trip(self, trip_id: UUID, user_id: UUID) -> None:
        trip = await self.get_trip(trip_id, user_id)
        await self.trips.delete(trip)

    def build_detail(self, trip: Trip) -> schemas.TripDetailResponse:
        summary = schemas.TimelineSummary(
            total_regions=len(trip.regions),
            regions=[
                schemas.TimelineSummaryRegion(
                    id=region.id,
                    name=region.name,
                    start_date=region.start_date,
                    end_date=region.end_date,
                )
                for region in trip.regions
            ],
        )
        detail = schemas.TripDetailResponse.model_validate(trip)
        detail.timeline_summary = summary
        return detail


class TimelineService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.trips = TripRepository(db)
        self.regions = RegionNodeRepository(db)

    async def _ensure_trip(self, trip_id: UUID, user_id: UUID) -> Trip:
        trip = await self.trips.get(trip_id, user_id)
        if trip is None:
            raise _not_found("Trip not found")
        return trip

    async def get_timeline(
        self, trip_id: UUID, user_id: UUID
    ) -> schemas.TimelineResponse:
        await self._ensure_trip(trip_id, user_id)
        regions = await self.regions.list_for_trip(trip_id)
        duration_days = 0
        if regions:
            start = min(r.start_date for r in regions)
            end = max(r.end_date for r in regions)
            duration_days = (end - start).days
        return schemas.TimelineResponse(
            trip_id=trip_id,
            regions=[
                schemas.RegionNodeResponse.model_validate(r) for r in regions
            ],
            summary={
                "total_regions": len(regions),
                "duration_days": duration_days,
                "total_budget": None,
            },
        )

    async def create_region(
        self,
        trip_id: UUID,
        payload: schemas.RegionNodeCreateRequest,
        user_id: UUID,
    ) -> RegionNode:
        await self._ensure_trip(trip_id, user_id)
        sequence = await self.regions.next_sequence(trip_id)
        node = RegionNode(
            trip_id=trip_id, sequence=sequence, **payload.model_dump()
        )
        return await self.regions.create(node)

    async def get_region(
        self, trip_id: UUID, region_node_id: UUID, user_id: UUID
    ) -> RegionNode:
        await self._ensure_trip(trip_id, user_id)
        node = await self.regions.get(region_node_id, trip_id)
        if node is None:
            raise _not_found("Region node not found")
        return node

    async def build_region_detail(
        self, node: RegionNode
    ) -> schemas.RegionNodeDetailResponse:
        selected_count = await self.regions.count_selected_locations(node.id)
        detail = schemas.RegionNodeDetailResponse.model_validate(node)
        detail.selected_locations_count = selected_count
        detail.state_reason = node.state_reason
        # Booking counts are owned by the Booking Service; exposed as zeros here
        # and intended to be hydrated by the gateway/aggregator when needed.
        detail.booking_summary = schemas.BookingSummary()
        return detail

    async def update_region(
        self,
        trip_id: UUID,
        region_node_id: UUID,
        payload: schemas.RegionNodeUpdateRequest,
        user_id: UUID,
    ) -> RegionNode:
        node = await self.get_region(trip_id, region_node_id, user_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(node, field, value)
        await self.db.flush()
        await self.db.refresh(node)
        return node

    async def delete_region(
        self, trip_id: UUID, region_node_id: UUID, user_id: UUID
    ) -> None:
        node = await self.get_region(trip_id, region_node_id, user_id)
        await self.regions.delete(node)


class SelectedLocationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.timeline = TimelineService(db)
        self.locations = SelectedLocationRepository(db)

    async def list(
        self, trip_id: UUID, region_node_id: UUID, user_id: UUID
    ) -> list[SelectedLocation]:
        await self.timeline.get_region(trip_id, region_node_id, user_id)
        return await self.locations.list_for_region(region_node_id)

    async def add(
        self,
        trip_id: UUID,
        region_node_id: UUID,
        payload: schemas.SelectedLocationCreateRequest,
        user_id: UUID,
    ) -> SelectedLocation:
        await self.timeline.get_region(trip_id, region_node_id, user_id)
        existing = await self.locations.get_by_location(
            region_node_id, payload.location_id
        )
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Location already selected for this region",
            )
        location = SelectedLocation(
            region_node_id=region_node_id, **payload.model_dump()
        )
        return await self.locations.create(location)

    async def update(
        self,
        trip_id: UUID,
        region_node_id: UUID,
        location_id: str,
        payload: schemas.SelectedLocationUpdateRequest,
        user_id: UUID,
    ) -> SelectedLocation:
        await self.timeline.get_region(trip_id, region_node_id, user_id)
        location = await self.locations.get_by_location(
            region_node_id, location_id
        )
        if location is None:
            raise _not_found("Selected location not found")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(location, field, value)
        await self.db.flush()
        await self.db.refresh(location)
        return location

    async def remove(
        self,
        trip_id: UUID,
        region_node_id: UUID,
        location_id: str,
        user_id: UUID,
    ) -> None:
        await self.timeline.get_region(trip_id, region_node_id, user_id)
        location = await self.locations.get_by_location(
            region_node_id, location_id
        )
        if location is None:
            raise _not_found("Selected location not found")
        await self.locations.delete(location)


class AlertService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.trips = TripRepository(db)
        self.regions = RegionNodeRepository(db)
        self.alerts = TripAlertRepository(db)

    async def _ensure_trip(self, trip_id: UUID, user_id: UUID) -> Trip:
        trip = await self.trips.get(trip_id, user_id)
        if trip is None:
            raise _not_found("Trip not found")
        return trip

    async def create(
        self,
        trip_id: UUID,
        payload: schemas.TripAlertCreateRequest,
        user_id: UUID,
    ) -> TripAlert:
        await self._ensure_trip(trip_id, user_id)
        alert = TripAlert(trip_id=trip_id, **payload.model_dump())
        return await self.alerts.create(alert)

    async def list(
        self, trip_id: UUID, status: str | None, user_id: UUID
    ) -> list[TripAlert]:
        await self._ensure_trip(trip_id, user_id)
        return await self.alerts.list_for_trip(trip_id, status)

    async def get(
        self, trip_id: UUID, alert_id: UUID, user_id: UUID
    ) -> TripAlert:
        await self._ensure_trip(trip_id, user_id)
        alert = await self.alerts.get(alert_id, trip_id)
        if alert is None:
            raise _not_found("Alert not found")
        return alert

    async def build_detail(
        self, trip_id: UUID, alert: TripAlert
    ) -> schemas.TripAlertDetailedResponse:
        detail = schemas.TripAlertDetailedResponse.model_validate(alert)
        region = await self.regions.get(alert.affected_region_id, trip_id)
        if region is not None:
            detail.affected_region = schemas.RegionNodeResponse.model_validate(
                region
            )
        detail.resolution_notes = alert.resolution_notes
        return detail

    async def update_status(
        self, trip_id: UUID, alert_id: UUID, new_status: str, user_id: UUID
    ) -> TripAlert:
        alert = await self.get(trip_id, alert_id, user_id)
        alert.status = AlertStatus(new_status)
        await self.db.flush()
        await self.db.refresh(alert)
        return alert

    async def propagate(
        self,
        trip_id: UUID,
        alert_id: UUID,
        payload: schemas.DisruptionPropagationRequest,
        user_id: UUID,
    ) -> schemas.DisruptionPropagationResponse:
        alert = await self.get(trip_id, alert_id, user_id)
        regions = await self.regions.list_for_trip(trip_id)

        primary = await self.regions.get(payload.affected_region_id, trip_id)
        primary_name = primary.name if primary else None

        # Downstream regions = those sequenced after the affected one.
        affected_seq = primary.sequence if primary else -1
        downstream = [r for r in regions if r.sequence > affected_seq]

        analysis: list[dict] = []
        for region in downstream:
            analysis.append(
                {
                    "region_id": str(region.id),
                    "region_name": region.name,
                    "risk_level": "high"
                    if payload.estimated_delay_minutes >= 120
                    else "medium",
                    "impact_type": "schedule_shift",
                    "original_dates": {
                        "start": region.start_date.isoformat(),
                        "end": region.end_date.isoformat(),
                    },
                    "suggested_adjustment": {
                        "time_shift_minutes": payload.estimated_delay_minutes,
                    },
                    "affected_bookings": [],
                    "recommendation": (
                        "Review transport connections and check-in times for "
                        f"{region.name}."
                    ),
                }
            )

        critical = sum(1 for a in analysis if a["risk_level"] == "high")
        return schemas.DisruptionPropagationResponse(
            alert_id=alert.id,
            primary_affected_region=primary_name,
            propagation_analysis=analysis,
            summary={
                "total_regions_affected": len(analysis),
                "critical_issues": critical,
                "recommended_actions": [
                    "Notify the traveler of potential downstream delays.",
                ]
                if analysis
                else [],
            },
        )
