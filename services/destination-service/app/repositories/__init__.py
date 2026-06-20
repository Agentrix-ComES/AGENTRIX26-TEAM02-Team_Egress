"""Data-access layer for the Destination Service catalog."""
from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Activity,
    DiningOption,
    EmergencyService,
    LocationCulturalContext,
    Offer,
    Region,
    RegionCulturalContext,
    VisitableLocation,
)


class RegionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, region: Region) -> Region:
        self.db.add(region)
        await self.db.flush()
        await self.db.refresh(region)
        return region

    async def get(self, region_id: UUID) -> Region | None:
        return await self.db.get(Region, region_id)

    async def list(
        self,
        country: str | None,
        search: str | None,
        skip: int,
        limit: int,
    ) -> tuple[list[Region], int]:
        base = select(Region)
        if country is not None:
            base = base.where(Region.country == country)
        if search is not None:
            base = base.where(Region.name.ilike(f"%{search}%"))
        total = await self.db.scalar(
            select(func.count()).select_from(base.subquery())
        )
        result = await self.db.execute(
            base.order_by(Region.name).offset(skip).limit(limit)
        )
        return list(result.scalars().all()), int(total or 0)

    async def delete(self, region: Region) -> None:
        await self.db.delete(region)

    async def catalog_counts(self, region_id: UUID) -> dict:
        async def count(model) -> int:
            total = await self.db.scalar(
                select(func.count())
                .select_from(model)
                .where(model.region_id == region_id)
            )
            return int(total or 0)

        culture = await self.db.scalar(
            select(func.count())
            .select_from(RegionCulturalContext)
            .where(RegionCulturalContext.region_id == region_id)
        )
        return {
            "locations": await count(VisitableLocation),
            "activities": await count(Activity),
            "dining_options": await count(DiningOption),
            "emergency_services": await count(EmergencyService),
            "offers": await count(Offer),
            "cultural_context_available": bool(culture),
        }


class LocationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, location: VisitableLocation) -> VisitableLocation:
        self.db.add(location)
        await self.db.flush()
        await self.db.refresh(location)
        return location

    async def get(
        self, region_id: UUID, location_id: UUID
    ) -> VisitableLocation | None:
        result = await self.db.execute(
            select(VisitableLocation).where(
                VisitableLocation.id == location_id,
                VisitableLocation.region_id == region_id,
            )
        )
        return result.scalar_one_or_none()

    async def list(
        self, region_id: UUID, category: str | None, skip: int, limit: int
    ) -> tuple[list[VisitableLocation], int]:
        base = select(VisitableLocation).where(
            VisitableLocation.region_id == region_id
        )
        if category is not None:
            base = base.where(VisitableLocation.category == category)
        total = await self.db.scalar(
            select(func.count()).select_from(base.subquery())
        )
        result = await self.db.execute(
            base.order_by(VisitableLocation.name).offset(skip).limit(limit)
        )
        return list(result.scalars().all()), int(total or 0)

    async def delete(self, location: VisitableLocation) -> None:
        await self.db.delete(location)


class ActivityRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, activity: Activity) -> Activity:
        self.db.add(activity)
        await self.db.flush()
        await self.db.refresh(activity)
        return activity

    async def get(self, region_id: UUID, activity_id: UUID) -> Activity | None:
        result = await self.db.execute(
            select(Activity).where(
                Activity.id == activity_id, Activity.region_id == region_id
            )
        )
        return result.scalar_one_or_none()

    async def list(
        self, region_id: UUID, difficulty: str | None
    ) -> list[Activity]:
        base = select(Activity).where(Activity.region_id == region_id)
        if difficulty is not None:
            base = base.where(Activity.difficulty_level == difficulty)
        result = await self.db.execute(base.order_by(Activity.name))
        return list(result.scalars().all())

    async def delete(self, activity: Activity) -> None:
        await self.db.delete(activity)


class DiningRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, dining: DiningOption) -> DiningOption:
        self.db.add(dining)
        await self.db.flush()
        await self.db.refresh(dining)
        return dining

    async def get(
        self, region_id: UUID, dining_option_id: UUID
    ) -> DiningOption | None:
        result = await self.db.execute(
            select(DiningOption).where(
                DiningOption.id == dining_option_id,
                DiningOption.region_id == region_id,
            )
        )
        return result.scalar_one_or_none()

    async def list(
        self, region_id: UUID, cuisine: str | None, dietary_filter: str | None
    ) -> list[DiningOption]:
        base = select(DiningOption).where(DiningOption.region_id == region_id)
        if cuisine is not None:
            base = base.where(DiningOption.cuisine == cuisine)
        result = await self.db.execute(base.order_by(DiningOption.name))
        options = list(result.scalars().all())
        if dietary_filter is not None:
            options = [
                o
                for o in options
                if dietary_filter in (o.dietary_accommodations or [])
            ]
        return options

    async def delete(self, dining: DiningOption) -> None:
        await self.db.delete(dining)


class EmergencyRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, service: EmergencyService) -> EmergencyService:
        self.db.add(service)
        await self.db.flush()
        await self.db.refresh(service)
        return service

    async def get(
        self, region_id: UUID, service_id: UUID
    ) -> EmergencyService | None:
        result = await self.db.execute(
            select(EmergencyService).where(
                EmergencyService.id == service_id,
                EmergencyService.region_id == region_id,
            )
        )
        return result.scalar_one_or_none()

    async def list(self, region_id: UUID) -> list[EmergencyService]:
        result = await self.db.execute(
            select(EmergencyService).where(
                EmergencyService.region_id == region_id
            )
        )
        return list(result.scalars().all())

    async def delete(self, service: EmergencyService) -> None:
        await self.db.delete(service)


class OfferRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, offer: Offer) -> Offer:
        self.db.add(offer)
        await self.db.flush()
        await self.db.refresh(offer)
        return offer

    async def get(self, region_id: UUID, offer_id: UUID) -> Offer | None:
        result = await self.db.execute(
            select(Offer).where(
                Offer.id == offer_id, Offer.region_id == region_id
            )
        )
        return result.scalar_one_or_none()

    async def list(self, region_id: UUID, category: str | None) -> list[Offer]:
        base = select(Offer).where(Offer.region_id == region_id)
        if category is not None:
            base = base.where(Offer.category == category)
        result = await self.db.execute(base.order_by(Offer.valid_until))
        return list(result.scalars().all())

    async def delete(self, offer: Offer) -> None:
        await self.db.delete(offer)


class CulturalContextRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_general(
        self, region_id: UUID
    ) -> RegionCulturalContext | None:
        result = await self.db.execute(
            select(RegionCulturalContext).where(
                RegionCulturalContext.region_id == region_id
            )
        )
        return result.scalar_one_or_none()

    async def upsert_general(
        self, region_id: UUID, values: dict
    ) -> RegionCulturalContext:
        existing = await self.get_general(region_id)
        if existing is None:
            existing = RegionCulturalContext(region_id=region_id, **values)
            self.db.add(existing)
        else:
            for key, value in values.items():
                setattr(existing, key, value)
        await self.db.flush()
        await self.db.refresh(existing)
        return existing

    async def list_locations(
        self, region_id: UUID
    ) -> list[LocationCulturalContext]:
        result = await self.db.execute(
            select(LocationCulturalContext).where(
                LocationCulturalContext.region_id == region_id
            )
        )
        return list(result.scalars().all())

    async def get_location(
        self, region_id: UUID, location_id: UUID
    ) -> LocationCulturalContext | None:
        result = await self.db.execute(
            select(LocationCulturalContext).where(
                LocationCulturalContext.region_id == region_id,
                LocationCulturalContext.location_id == location_id,
            )
        )
        return result.scalar_one_or_none()

    async def create_location(
        self, context: LocationCulturalContext
    ) -> LocationCulturalContext:
        self.db.add(context)
        await self.db.flush()
        await self.db.refresh(context)
        return context

    async def delete_location(self, context: LocationCulturalContext) -> None:
        await self.db.delete(context)
