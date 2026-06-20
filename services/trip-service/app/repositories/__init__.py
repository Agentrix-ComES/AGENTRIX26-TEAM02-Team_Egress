"""Data-access layer for the Trip Service."""
from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    RegionNode,
    SelectedLocation,
    Trip,
    TripAlert,
)


class TripRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, trip: Trip) -> Trip:
        self.db.add(trip)
        await self.db.flush()
        await self.db.refresh(trip)
        return trip

    async def get(self, trip_id: UUID, user_id: UUID) -> Trip | None:
        result = await self.db.execute(
            select(Trip).where(Trip.id == trip_id, Trip.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_with_regions(self, trip_id: UUID, user_id: UUID) -> Trip | None:
        result = await self.db.execute(
            select(Trip)
            .where(Trip.id == trip_id, Trip.user_id == user_id)
            .options(selectinload(Trip.regions))
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        user_id: UUID,
        status: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Trip], int]:
        base = select(Trip).where(Trip.user_id == user_id)
        if status is not None:
            base = base.where(Trip.status == status)

        total = await self.db.scalar(
            select(func.count()).select_from(base.subquery())
        )
        result = await self.db.execute(
            base.order_by(Trip.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all()), int(total or 0)

    async def delete(self, trip: Trip) -> None:
        await self.db.delete(trip)


class RegionNodeRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, node: RegionNode) -> RegionNode:
        self.db.add(node)
        await self.db.flush()
        await self.db.refresh(node)
        return node

    async def get(self, region_node_id: UUID, trip_id: UUID) -> RegionNode | None:
        result = await self.db.execute(
            select(RegionNode).where(
                RegionNode.id == region_node_id, RegionNode.trip_id == trip_id
            )
        )
        return result.scalar_one_or_none()

    async def list_for_trip(self, trip_id: UUID) -> list[RegionNode]:
        result = await self.db.execute(
            select(RegionNode)
            .where(RegionNode.trip_id == trip_id)
            .order_by(RegionNode.sequence)
        )
        return list(result.scalars().all())

    async def next_sequence(self, trip_id: UUID) -> int:
        current = await self.db.scalar(
            select(func.coalesce(func.max(RegionNode.sequence), -1)).where(
                RegionNode.trip_id == trip_id
            )
        )
        return int(current) + 1

    async def count_selected_locations(self, region_node_id: UUID) -> int:
        total = await self.db.scalar(
            select(func.count()).select_from(SelectedLocation).where(
                SelectedLocation.region_node_id == region_node_id
            )
        )
        return int(total or 0)

    async def delete(self, node: RegionNode) -> None:
        await self.db.delete(node)


class SelectedLocationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, location: SelectedLocation) -> SelectedLocation:
        self.db.add(location)
        await self.db.flush()
        await self.db.refresh(location)
        return location

    async def list_for_region(
        self, region_node_id: UUID
    ) -> list[SelectedLocation]:
        result = await self.db.execute(
            select(SelectedLocation)
            .where(SelectedLocation.region_node_id == region_node_id)
            .order_by(SelectedLocation.added_at)
        )
        return list(result.scalars().all())

    async def get_by_location(
        self, region_node_id: UUID, location_id: str
    ) -> SelectedLocation | None:
        result = await self.db.execute(
            select(SelectedLocation).where(
                SelectedLocation.region_node_id == region_node_id,
                SelectedLocation.location_id == location_id,
            )
        )
        return result.scalar_one_or_none()

    async def delete(self, location: SelectedLocation) -> None:
        await self.db.delete(location)


class TripAlertRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, alert: TripAlert) -> TripAlert:
        self.db.add(alert)
        await self.db.flush()
        await self.db.refresh(alert)
        return alert

    async def get(self, alert_id: UUID, trip_id: UUID) -> TripAlert | None:
        result = await self.db.execute(
            select(TripAlert).where(
                TripAlert.id == alert_id, TripAlert.trip_id == trip_id
            )
        )
        return result.scalar_one_or_none()

    async def list_for_trip(
        self, trip_id: UUID, status: str | None = None
    ) -> list[TripAlert]:
        base = select(TripAlert).where(TripAlert.trip_id == trip_id)
        if status is not None:
            base = base.where(TripAlert.status == status)
        result = await self.db.execute(base.order_by(TripAlert.created_at.desc()))
        return list(result.scalars().all())
