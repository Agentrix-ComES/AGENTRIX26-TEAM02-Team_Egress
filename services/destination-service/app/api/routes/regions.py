"""Region (destination registry) endpoints."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import RegionService

router = APIRouter(prefix="/regions", tags=["Regions"])


@router.get("")
async def list_regions(
    db: DbSession,
    user: AuthUser,
    country: Annotated[str | None, Query()] = None,
    search: Annotated[str | None, Query()] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
) -> schemas.RegionListResponse:
    items, total = await RegionService(db).list(country, search, skip, limit)
    return schemas.RegionListResponse(
        items=[schemas.RegionResponse.model_validate(r) for r in items],
        total=total,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_region(
    payload: schemas.RegionCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.RegionResponse:
    region = await RegionService(db).create(payload)
    return schemas.RegionResponse.model_validate(region)


@router.get("/{region_id}")
async def get_region(
    region_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.RegionDetailResponse:
    return await RegionService(db).get_detail(region_id)


@router.patch("/{region_id}")
async def update_region(
    region_id: UUID,
    payload: schemas.RegionUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.RegionResponse:
    region = await RegionService(db).update(region_id, payload)
    return schemas.RegionResponse.model_validate(region)


@router.delete("/{region_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_region(
    region_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> None:
    await RegionService(db).delete(region_id)
