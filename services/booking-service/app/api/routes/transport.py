"""Transport booking endpoints."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import TransportBookingService

router = APIRouter(prefix="/transport-bookings", tags=["Transport Bookings"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_transport_booking(
    payload: schemas.TransportBookingCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.TransportBookingResponse:
    booking = await TransportBookingService(db).create(payload, user.id)
    return schemas.TransportBookingResponse.model_validate(booking)


@router.get("")
async def list_transport_bookings(
    db: DbSession,
    user: AuthUser,
    trip_id: Annotated[UUID, Query()],
    region_node_id: Annotated[UUID | None, Query()] = None,
    booking_status: Annotated[str | None, Query()] = None,
) -> list[schemas.TransportBookingResponse]:
    items = await TransportBookingService(db).list(
        user.id, trip_id, region_node_id, booking_status
    )
    return [schemas.TransportBookingResponse.model_validate(i) for i in items]


@router.get("/{booking_id}")
async def get_transport_booking(
    booking_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.TransportBookingResponse:
    booking = await TransportBookingService(db).get(booking_id, user.id)
    return schemas.TransportBookingResponse.model_validate(booking)


@router.patch("/{booking_id}")
async def update_transport_booking(
    booking_id: UUID,
    payload: schemas.TransportBookingUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.TransportBookingResponse:
    booking = await TransportBookingService(db).update(
        booking_id, payload, user.id
    )
    return schemas.TransportBookingResponse.model_validate(booking)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transport_booking(
    booking_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> None:
    await TransportBookingService(db).delete(booking_id, user.id)
