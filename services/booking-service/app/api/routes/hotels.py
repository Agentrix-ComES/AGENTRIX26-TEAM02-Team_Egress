"""Hotel search and booking endpoints.

These live on two distinct top-level paths (``/hotels/search`` and
``/hotel-bookings``) so the router is declared without a shared prefix.
"""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import HotelService

router = APIRouter(tags=["Hotels"])


@router.post("/hotels/search")
async def search_hotels(
    payload: schemas.HotelSearchRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.HotelSearchResponse:
    return HotelService(db).search(payload)


@router.post("/hotel-bookings", status_code=status.HTTP_201_CREATED)
async def create_hotel_booking(
    payload: schemas.HotelBookingRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.HotelBookingResponse:
    booking = await HotelService(db).create_booking(payload, user.id)
    return schemas.HotelBookingResponse.model_validate(booking)


@router.get("/hotel-bookings")
async def list_hotel_bookings(
    db: DbSession,
    user: AuthUser,
    trip_id: Annotated[UUID, Query()],
    region_node_id: Annotated[UUID | None, Query()] = None,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
) -> list[schemas.HotelBookingResponse]:
    items = await HotelService(db).list_bookings(
        user.id, trip_id, region_node_id, status_filter
    )
    return [schemas.HotelBookingResponse.model_validate(i) for i in items]


@router.get("/hotel-bookings/{booking_id}")
async def get_hotel_booking(
    booking_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.HotelBookingResponse:
    booking = await HotelService(db).get_booking(booking_id, user.id)
    return schemas.HotelBookingResponse.model_validate(booking)


@router.patch("/hotel-bookings/{booking_id}")
async def update_hotel_booking(
    booking_id: UUID,
    payload: schemas.HotelBookingUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.HotelBookingResponse:
    booking = await HotelService(db).update_booking(booking_id, payload, user.id)
    return schemas.HotelBookingResponse.model_validate(booking)


@router.delete(
    "/hotel-bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def cancel_hotel_booking(
    booking_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> None:
    await HotelService(db).cancel_booking(booking_id, user.id)
