"""Dining reservation endpoints."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import DiningReservationService

router = APIRouter(prefix="/dining-reservations", tags=["Dining Reservations"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_dining_reservation(
    payload: schemas.DiningReservationRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.DiningReservationResponse:
    reservation = await DiningReservationService(db).create(payload, user.id)
    return schemas.DiningReservationResponse.model_validate(reservation)


@router.get("")
async def list_dining_reservations(
    db: DbSession,
    user: AuthUser,
    trip_id: Annotated[UUID, Query()],
    region_node_id: Annotated[UUID | None, Query()] = None,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
) -> list[schemas.DiningReservationResponse]:
    items = await DiningReservationService(db).list(
        user.id, trip_id, region_node_id, status_filter
    )
    return [schemas.DiningReservationResponse.model_validate(i) for i in items]


@router.get("/{reservation_id}")
async def get_dining_reservation(
    reservation_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.DiningReservationResponse:
    reservation = await DiningReservationService(db).get(reservation_id, user.id)
    return schemas.DiningReservationResponse.model_validate(reservation)


@router.patch("/{reservation_id}")
async def update_dining_reservation(
    reservation_id: UUID,
    payload: schemas.DiningReservationUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.DiningReservationResponse:
    reservation = await DiningReservationService(db).update(
        reservation_id, payload, user.id
    )
    return schemas.DiningReservationResponse.model_validate(reservation)


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_dining_reservation(
    reservation_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> None:
    await DiningReservationService(db).cancel(reservation_id, user.id)
