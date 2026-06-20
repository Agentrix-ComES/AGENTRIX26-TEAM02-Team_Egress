"""Business logic for the Destination Service.

Handles catalog CRUD plus a few shaped read models that the OpenAPI contract
expects (nested geo objects, aggregated emergency services and the composed
cultural-context document).
"""
from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.models import (
    Activity,
    DiningOption,
    EmergencyService,
    LocationCulturalContext,
    Offer,
    Region,
    VisitableLocation,
)
from app.repositories import (
    ActivityRepository,
    CulturalContextRepository,
    DiningRepository,
    EmergencyRepository,
    LocationRepository,
    OfferRepository,
    RegionRepository,
)

_REGION_NOT_FOUND = "Region not found"


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _parse_uuid(value: str, label: str) -> UUID:
    try:
        return UUID(value)
    except (ValueError, TypeError) as exc:
        raise _not_found(f"{label} not found") from exc


class RegionService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.regions = RegionRepository(db)

    async def create(self, payload: schemas.RegionCreateRequest) -> Region:
        return await self.regions.create(Region(**payload.model_dump()))

    async def list(
        self, country: str | None, search: str | None, skip: int, limit: int
    ) -> tuple[list[Region], int]:
        return await self.regions.list(country, search, skip, limit)

    async def get(self, region_id: UUID) -> Region:
        region = await self.regions.get(region_id)
        if region is None:
            raise _not_found(_REGION_NOT_FOUND)
        return region

    async def get_detail(
        self, region_id: UUID
    ) -> schemas.RegionDetailResponse:
        region = await self.get(region_id)
        counts = await self.regions.catalog_counts(region_id)
        detail = schemas.RegionDetailResponse.model_validate(region)
        detail.catalog_counts = schemas.CatalogCounts(**counts)
        return detail

    async def update(
        self, region_id: UUID, payload: schemas.RegionUpdateRequest
    ) -> Region:
        region = await self.get(region_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(region, field, value)
        await self.db.flush()
        await self.db.refresh(region)
        return region

    async def delete(self, region_id: UUID) -> None:
        region = await self.get(region_id)
        await self.regions.delete(region)


class LocationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.regions = RegionRepository(db)
        self.locations = LocationRepository(db)

    async def _ensure_region(self, region_id: UUID) -> None:
        if await self.regions.get(region_id) is None:
            raise _not_found(_REGION_NOT_FOUND)

    @staticmethod
    def to_response(
        location: VisitableLocation,
    ) -> schemas.VisitableLocationResponse:
        return schemas.VisitableLocationResponse(
            id=location.id,
            region_id=location.region_id,
            name=location.name,
            description=location.description,
            category=location.category.value
            if hasattr(location.category, "value")
            else location.category,
            location=schemas.GeoLocation(
                latitude=location.latitude,
                longitude=location.longitude,
                address=location.address,
            ),
            rating=location.rating,
            review_count=location.review_count,
            entry_fee=location.entry_fee,
            estimated_duration_minutes=location.estimated_duration_minutes,
            opening_hours=location.opening_hours,
            best_time_to_visit=location.best_time_to_visit,
            difficulty_level=location.difficulty_level.value
            if location.difficulty_level is not None
            else None,
            accessibility_info=location.accessibility_info,
            guided_tour_available=location.guided_tour_available,
            images=location.images or [],
            cultural_context_short=location.cultural_context_short,
        )

    async def create(
        self, region_id: UUID, payload: schemas.VisitableLocationCreateRequest
    ) -> VisitableLocation:
        await self._ensure_region(region_id)
        return await self.locations.create(
            VisitableLocation(region_id=region_id, **payload.model_dump())
        )

    async def list(
        self, region_id: UUID, category: str | None, skip: int, limit: int
    ) -> tuple[list[VisitableLocation], int]:
        await self._ensure_region(region_id)
        return await self.locations.list(region_id, category, skip, limit)

    async def get(
        self, region_id: UUID, location_id: str
    ) -> VisitableLocation:
        await self._ensure_region(region_id)
        loc_id = _parse_uuid(location_id, "Location")
        location = await self.locations.get(region_id, loc_id)
        if location is None:
            raise _not_found("Location not found")
        return location

    async def update(
        self,
        region_id: UUID,
        location_id: str,
        payload: schemas.VisitableLocationUpdateRequest,
    ) -> VisitableLocation:
        location = await self.get(region_id, location_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(location, field, value)
        await self.db.flush()
        await self.db.refresh(location)
        return location

    async def delete(self, region_id: UUID, location_id: str) -> None:
        location = await self.get(region_id, location_id)
        await self.locations.delete(location)


class ActivityService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.regions = RegionRepository(db)
        self.activities = ActivityRepository(db)

    async def _ensure_region(self, region_id: UUID) -> None:
        if await self.regions.get(region_id) is None:
            raise _not_found(_REGION_NOT_FOUND)

    async def create(
        self, region_id: UUID, payload: schemas.ActivityCreateRequest
    ) -> Activity:
        await self._ensure_region(region_id)
        data = payload.model_dump()
        age = data.pop("age_requirements", None)
        activity = Activity(region_id=region_id, age_requirements=age, **data)
        return await self.activities.create(activity)

    async def list(
        self, region_id: UUID, difficulty: str | None
    ) -> list[Activity]:
        await self._ensure_region(region_id)
        return await self.activities.list(region_id, difficulty)

    async def get(self, region_id: UUID, activity_id: str) -> Activity:
        await self._ensure_region(region_id)
        act_id = _parse_uuid(activity_id, "Activity")
        activity = await self.activities.get(region_id, act_id)
        if activity is None:
            raise _not_found("Activity not found")
        return activity

    async def update(
        self,
        region_id: UUID,
        activity_id: str,
        payload: schemas.ActivityUpdateRequest,
    ) -> Activity:
        activity = await self.get(region_id, activity_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(activity, field, value)
        await self.db.flush()
        await self.db.refresh(activity)
        return activity

    async def delete(self, region_id: UUID, activity_id: str) -> None:
        activity = await self.get(region_id, activity_id)
        await self.activities.delete(activity)


class DiningService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.regions = RegionRepository(db)
        self.dining = DiningRepository(db)

    async def _ensure_region(self, region_id: UUID) -> None:
        if await self.regions.get(region_id) is None:
            raise _not_found(_REGION_NOT_FOUND)

    @staticmethod
    def to_response(option: DiningOption) -> schemas.DiningOptionResponse:
        return schemas.DiningOptionResponse(
            id=option.id,
            region_id=option.region_id,
            name=option.name,
            type=option.type.value if hasattr(option.type, "value") else option.type,
            cuisine=option.cuisine,
            location=schemas.DiningLocation(
                address=option.address,
                latitude=option.latitude,
                longitude=option.longitude,
            ),
            rating=option.rating,
            review_count=option.review_count,
            average_cost_per_person=option.average_cost_per_person,
            operating_hours=option.operating_hours,
            dietary_accommodations=option.dietary_accommodations or [],
            specialties=option.specialties or [],
            reservation_required=option.reservation_required,
            parking_available=option.parking_available,
            phone=option.phone,
            website=option.website,
            images=option.images or [],
        )

    async def create(
        self, region_id: UUID, payload: schemas.DiningOptionCreateRequest
    ) -> DiningOption:
        await self._ensure_region(region_id)
        return await self.dining.create(
            DiningOption(region_id=region_id, **payload.model_dump())
        )

    async def list(
        self, region_id: UUID, cuisine: str | None, dietary_filter: str | None
    ) -> list[DiningOption]:
        await self._ensure_region(region_id)
        return await self.dining.list(region_id, cuisine, dietary_filter)

    async def get(self, region_id: UUID, dining_option_id: str) -> DiningOption:
        await self._ensure_region(region_id)
        d_id = _parse_uuid(dining_option_id, "Dining option")
        option = await self.dining.get(region_id, d_id)
        if option is None:
            raise _not_found("Dining option not found")
        return option

    async def update(
        self,
        region_id: UUID,
        dining_option_id: str,
        payload: schemas.DiningOptionUpdateRequest,
    ) -> DiningOption:
        option = await self.get(region_id, dining_option_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(option, field, value)
        await self.db.flush()
        await self.db.refresh(option)
        return option

    async def delete(self, region_id: UUID, dining_option_id: str) -> None:
        option = await self.get(region_id, dining_option_id)
        await self.dining.delete(option)


class EmergencyFacilityService:
    """Service object for emergency facilities (named distinctly from the
    ``EmergencyService`` ORM model to avoid a symbol clash)."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.regions = RegionRepository(db)
        self.services = EmergencyRepository(db)

    async def _get_region(self, region_id: UUID) -> Region:
        region = await self.regions.get(region_id)
        if region is None:
            raise _not_found(_REGION_NOT_FOUND)
        return region

    async def aggregate(
        self, region_id: UUID
    ) -> schemas.EmergencyServicesResponse:
        region = await self._get_region(region_id)
        items = await self.services.list(region_id)

        response = schemas.EmergencyServicesResponse(region_name=region.name)
        for item in items:
            stype = (
                item.service_type.value
                if hasattr(item.service_type, "value")
                else item.service_type
            )
            if stype == "hospital":
                response.hospitals.append(
                    schemas.HospitalInfo(
                        id=str(item.id),
                        name=item.name,
                        address=item.address,
                        latitude=item.latitude,
                        longitude=item.longitude,
                        phone=item.phone,
                        emergency_phone=item.emergency_phone,
                        website=item.website,
                        specialties=item.specialties or [],
                        availability=item.availability,
                    )
                )
            elif stype == "clinic":
                response.clinics.append(
                    schemas.ClinicInfo(
                        id=str(item.id),
                        name=item.name,
                        address=item.address,
                        phone=item.phone,
                        specialties=item.specialties or [],
                        operating_hours=item.availability,
                    )
                )
            elif stype == "police":
                response.police_station = schemas.PoliceStationInfo(
                    id=str(item.id),
                    name=item.name,
                    address=item.address,
                    phone=item.phone,
                    emergency_phone=item.emergency_phone,
                    latitude=item.latitude,
                    longitude=item.longitude,
                )
            elif stype == "fire":
                response.fire_service = schemas.FireServiceInfo(
                    emergency_phone=item.emergency_phone or item.phone,
                    address=item.address,
                )
            elif stype == "embassy":
                response.nearest_embassy = schemas.EmbassyInfo(
                    country=(item.additional_info or {}).get("country"),
                    address=item.address,
                    phone=item.phone,
                    emergency_phone=item.emergency_phone,
                )
            else:  # emergency_contact
                response.emergency_contacts.append(
                    schemas.EmergencyContactInfo(
                        service_type=stype,
                        name=item.name,
                        phone=item.phone,
                    )
                )
        return response

    async def create(
        self, region_id: UUID, payload: schemas.EmergencyServiceCreateRequest
    ) -> EmergencyService:
        await self._get_region(region_id)
        return await self.services.create(
            EmergencyService(region_id=region_id, **payload.model_dump())
        )

    async def get(self, region_id: UUID, service_id: UUID) -> EmergencyService:
        await self._get_region(region_id)
        service = await self.services.get(region_id, service_id)
        if service is None:
            raise _not_found("Emergency service not found")
        return service

    async def update(
        self,
        region_id: UUID,
        service_id: UUID,
        payload: schemas.EmergencyServiceUpdateRequest,
    ) -> EmergencyService:
        service = await self.get(region_id, service_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(service, field, value)
        await self.db.flush()
        await self.db.refresh(service)
        return service

    async def delete(self, region_id: UUID, service_id: UUID) -> None:
        service = await self.get(region_id, service_id)
        await self.services.delete(service)


class OfferService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.regions = RegionRepository(db)
        self.offers = OfferRepository(db)

    async def _ensure_region(self, region_id: UUID) -> None:
        if await self.regions.get(region_id) is None:
            raise _not_found(_REGION_NOT_FOUND)

    async def create(
        self, region_id: UUID, payload: schemas.OfferCreateRequest
    ) -> Offer:
        await self._ensure_region(region_id)
        return await self.offers.create(
            Offer(region_id=region_id, **payload.model_dump())
        )

    async def list(self, region_id: UUID, category: str | None) -> list[Offer]:
        await self._ensure_region(region_id)
        return await self.offers.list(region_id, category)

    async def get(self, region_id: UUID, offer_id: str) -> Offer:
        await self._ensure_region(region_id)
        o_id = _parse_uuid(offer_id, "Offer")
        offer = await self.offers.get(region_id, o_id)
        if offer is None:
            raise _not_found("Offer not found")
        return offer

    async def update(
        self, region_id: UUID, offer_id: str, payload: schemas.OfferUpdateRequest
    ) -> Offer:
        offer = await self.get(region_id, offer_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(offer, field, value)
        await self.db.flush()
        await self.db.refresh(offer)
        return offer

    async def delete(self, region_id: UUID, offer_id: str) -> None:
        offer = await self.get(region_id, offer_id)
        await self.offers.delete(offer)


class CulturalContextService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.regions = RegionRepository(db)
        self.contexts = CulturalContextRepository(db)

    async def _get_region(self, region_id: UUID) -> Region:
        region = await self.regions.get(region_id)
        if region is None:
            raise _not_found(_REGION_NOT_FOUND)
        return region

    @staticmethod
    def _location_to_schema(
        ctx: LocationCulturalContext,
    ) -> schemas.LocationCulturalContext:
        return schemas.LocationCulturalContext(
            location_id=str(ctx.location_id),
            location_name=ctx.location_name,
            significance=ctx.significance,
            dress_code=ctx.dress_code,
            photography_allowed=ctx.photography_allowed,
            photography_restrictions=ctx.photography_restrictions,
            behavioral_expectations=ctx.behavioral_expectations or [],
            visiting_hours=ctx.visiting_hours,
            important_dates_restricted=ctx.important_dates_restricted or [],
            guides_available=ctx.guides_available,
            entry_rituals_if_any=ctx.entry_rituals_if_any,
            tips=ctx.tips or [],
        )

    async def get(self, region_id: UUID) -> schemas.CulturalContextResponse:
        region = await self._get_region(region_id)
        general = await self.contexts.get_general(region_id)
        locations = await self.contexts.list_locations(region_id)

        general_schema = None
        festivals: list = []
        summary = None
        if general is not None:
            general_schema = schemas.GeneralCulturalContext(
                history=general.history,
                religion_predominant=general.religion_predominant,
                language=general.language,
                local_customs=general.local_customs or [],
                dress_code_general=general.dress_code_general,
                photography_etiquette=general.photography_etiquette,
                greetings_customs=general.greetings_customs,
                dining_etiquette=general.dining_etiquette,
                tips_and_gratuity=general.tips_and_gratuity,
                business_hours_note=general.business_hours_note,
            )
            festivals = general.regional_festivals_events or []
            summary = general.local_customs_summary

        return schemas.CulturalContextResponse(
            region_name=region.name,
            general_context=general_schema,
            locations_context=[
                self._location_to_schema(c) for c in locations
            ],
            regional_festivals_events=festivals,
            local_customs_summary=summary,
        )

    async def update_general(
        self,
        region_id: UUID,
        payload: schemas.GeneralCulturalContextUpdateRequest,
    ) -> schemas.CulturalContextResponse:
        await self._get_region(region_id)
        await self.contexts.upsert_general(
            region_id, payload.model_dump(exclude_unset=True)
        )
        return await self.get(region_id)

    async def add_location(
        self,
        region_id: UUID,
        location_id: str,
        payload: schemas.LocationCulturalContextCreateRequest,
    ) -> schemas.LocationCulturalContext:
        await self._get_region(region_id)
        loc_id = _parse_uuid(location_id, "Location")
        if await self.contexts.get_location(region_id, loc_id) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cultural context already exists for this location",
            )
        # mode="json" renders nested dates as ISO strings for JSONB storage.
        data = payload.model_dump(mode="json")
        context = LocationCulturalContext(
            region_id=region_id, location_id=loc_id, **data
        )
        created = await self.contexts.create_location(context)
        return self._location_to_schema(created)

    async def update_location(
        self,
        region_id: UUID,
        location_id: str,
        payload: schemas.LocationCulturalContextUpdateRequest,
    ) -> schemas.LocationCulturalContext:
        await self._get_region(region_id)
        loc_id = _parse_uuid(location_id, "Location")
        context = await self.contexts.get_location(region_id, loc_id)
        if context is None:
            raise _not_found("Location cultural context not found")
        for field, value in payload.model_dump(
            mode="json", exclude_unset=True
        ).items():
            setattr(context, field, value)
        await self.db.flush()
        await self.db.refresh(context)
        return self._location_to_schema(context)

    async def delete_location(self, region_id: UUID, location_id: str) -> None:
        await self._get_region(region_id)
        loc_id = _parse_uuid(location_id, "Location")
        context = await self.contexts.get_location(region_id, loc_id)
        if context is None:
            raise _not_found("Location cultural context not found")
        await self.contexts.delete_location(context)
