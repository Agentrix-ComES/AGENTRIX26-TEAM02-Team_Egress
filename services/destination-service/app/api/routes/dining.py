"""Dining option (catalog) endpoints."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import DiningService

router = APIRouter(prefix="/regions/{region_id}/dining", tags=["Dining"])


@router.get("")
async def list_dining_options(
    region_id: UUID,
    db: DbSession,
    user: AuthUser,
    cuisine: Annotated[str | None, Query()] = None,
    dietary_filter: Annotated[str | None, Query()] = None,
) -> list[schemas.DiningOptionResponse]:
    service = DiningService(db)
    items = await service.list(region_id, cuisine, dietary_filter)
    return [service.to_response(i) for i in items]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_dining_option(
    region_id: UUID,
    payload: schemas.DiningOptionCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.DiningOptionResponse:
    service = DiningService(db)
    option = await service.create(region_id, payload)
    return service.to_response(option)


@router.get("/{dining_option_id}")
async def get_dining_option(
    region_id: UUID,
    dining_option_id: str,
    db: DbSession,
    user: AuthUser,
) -> schemas.DiningOptionResponse:
    service = DiningService(db)
    option = await service.get(region_id, dining_option_id)
    return service.to_response(option)


@router.patch("/{dining_option_id}")
async def update_dining_option(
    region_id: UUID,
    dining_option_id: str,
    payload: schemas.DiningOptionUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.DiningOptionResponse:
    service = DiningService(db)
    option = await service.update(region_id, dining_option_id, payload)
    return service.to_response(option)


@router.delete("/{dining_option_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dining_option(
    region_id: UUID,
    dining_option_id: str,
    db: DbSession,
    user: AuthUser,
) -> None:
    await DiningService(db).delete(region_id, dining_option_id)
