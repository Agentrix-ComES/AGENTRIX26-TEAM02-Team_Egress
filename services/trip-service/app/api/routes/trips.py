"""Trip CRUD endpoints."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import TripService

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_trip(
    payload: schemas.TripCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.TripResponse:
    trip = await TripService(db).create_trip(payload, user.id)
    return schemas.TripResponse.model_validate(trip)


@router.get("")
async def list_trips(
    db: DbSession,
    user: AuthUser,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> schemas.TripListResponse:
    items, total = await TripService(db).list_trips(
        user.id, status_filter, skip, limit
    )
    return schemas.TripListResponse(
        items=[schemas.TripResponse.model_validate(t) for t in items],
        total=total,
    )


@router.get("/{trip_id}")
async def get_trip(
    trip_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.TripDetailResponse:
    return await TripService(db).get_trip_detail(trip_id, user.id)


@router.patch("/{trip_id}")
async def update_trip(
    trip_id: UUID,
    payload: schemas.TripUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.TripResponse:
    trip = await TripService(db).update_trip(trip_id, payload, user.id)
    return schemas.TripResponse.model_validate(trip)


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> None:
    await TripService(db).delete_trip(trip_id, user.id)
