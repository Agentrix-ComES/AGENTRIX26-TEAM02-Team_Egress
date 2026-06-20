"""Cultural context endpoints (region-wide and location-specific)."""
from uuid import UUID

from fastapi import APIRouter, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import CulturalContextService

router = APIRouter(prefix="/regions/{region_id}/culture", tags=["Cultural Context"])


@router.get("")
async def get_cultural_context(
    region_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.CulturalContextResponse:
    return await CulturalContextService(db).get(region_id)


@router.patch("")
async def update_cultural_context(
    region_id: UUID,
    payload: schemas.GeneralCulturalContextUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.CulturalContextResponse:
    return await CulturalContextService(db).update_general(region_id, payload)


@router.post("/locations/{location_id}", status_code=status.HTTP_201_CREATED)
async def add_location_cultural_context(
    region_id: UUID,
    location_id: str,
    payload: schemas.LocationCulturalContextCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.LocationCulturalContext:
    return await CulturalContextService(db).add_location(
        region_id, location_id, payload
    )


@router.patch("/locations/{location_id}")
async def update_location_cultural_context(
    region_id: UUID,
    location_id: str,
    payload: schemas.LocationCulturalContextUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.LocationCulturalContext:
    return await CulturalContextService(db).update_location(
        region_id, location_id, payload
    )


@router.delete(
    "/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_location_cultural_context(
    region_id: UUID,
    location_id: str,
    db: DbSession,
    user: AuthUser,
) -> None:
    await CulturalContextService(db).delete_location(region_id, location_id)
