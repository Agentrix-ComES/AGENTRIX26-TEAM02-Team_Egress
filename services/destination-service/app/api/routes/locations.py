"""Visitable location endpoints."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import LocationService

router = APIRouter(prefix="/regions/{region_id}/locations", tags=["Visitable Locations"])


@router.get("")
async def list_locations(
    region_id: UUID,
    db: DbSession,
    user: AuthUser,
    category: Annotated[str | None, Query()] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
) -> schemas.VisitableLocationListResponse:
    service = LocationService(db)
    items, total = await service.list(region_id, category, skip, limit)
    return schemas.VisitableLocationListResponse(
        items=[service.to_response(i) for i in items],
        total=total,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_location(
    region_id: UUID,
    payload: schemas.VisitableLocationCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.VisitableLocationResponse:
    service = LocationService(db)
    location = await service.create(region_id, payload)
    return service.to_response(location)


@router.get("/{location_id}")
async def get_location(
    region_id: UUID,
    location_id: str,
    db: DbSession,
    user: AuthUser,
) -> schemas.VisitableLocationResponse:
    service = LocationService(db)
    location = await service.get(region_id, location_id)
    return service.to_response(location)


@router.patch("/{location_id}")
async def update_location(
    region_id: UUID,
    location_id: str,
    payload: schemas.VisitableLocationUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.VisitableLocationResponse:
    service = LocationService(db)
    location = await service.update(region_id, location_id, payload)
    return service.to_response(location)


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    region_id: UUID,
    location_id: str,
    db: DbSession,
    user: AuthUser,
) -> None:
    await LocationService(db).delete(region_id, location_id)
