"""Business logic for the Booking Service.

Transport, hotel and dining transactions plus a deterministic mock hotel
search. Real provider integrations are intentionally stubbed: the search and
pricing produce stable, plausible data so the rest of the platform (and the
AI planner) can be exercised end-to-end without external dependencies.
"""
from __future__ import annotations

import hashlib
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.models import DiningReservation, HotelBooking, TransportBooking
from app.repositories import (
    DiningReservationRepository,
    HotelBookingRepository,
    TransportBookingRepository,
)

_BOOKING_NOT_FOUND = "Booking not found"
_RESERVATION_NOT_FOUND = "Reservation not found"


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _reference(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10].upper()}"


class TransportBookingService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.bookings = TransportBookingRepository(db)

    async def create(
        self, payload: schemas.TransportBookingCreateRequest, user_id: UUID
    ) -> TransportBooking:
        data = payload.model_dump()
        if not data.get("booking_reference"):
            data["booking_reference"] = _reference("TRP")
        booking = TransportBooking(user_id=user_id, **data)
        return await self.bookings.create(booking)

    async def list(
        self,
        user_id: UUID,
        trip_id: UUID,
        region_node_id: UUID | None,
        booking_status: str | None,
    ) -> list[TransportBooking]:
        return await self.bookings.list(
            user_id, trip_id, region_node_id, booking_status
        )

    async def get(self, booking_id: UUID, user_id: UUID) -> TransportBooking:
        booking = await self.bookings.get(booking_id, user_id)
        if booking is None:
            raise _not_found(_BOOKING_NOT_FOUND)
        return booking

    async def update(
        self,
        booking_id: UUID,
        payload: schemas.TransportBookingUpdateRequest,
        user_id: UUID,
    ) -> TransportBooking:
        booking = await self.get(booking_id, user_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(booking, field, value)
        await self.db.flush()
        await self.db.refresh(booking)
        return booking

    async def delete(self, booking_id: UUID, user_id: UUID) -> None:
        booking = await self.get(booking_id, user_id)
        await self.bookings.delete(booking)


class HotelService:
    _SAMPLE_NAMES = [
        ("Grand Lagoon Hotel", 4.5, 120.0),
        ("City Central Inn", 4.0, 75.0),
        ("Seaside Boutique Resort", 4.7, 180.0),
        ("Budget Stay Lodge", 3.6, 45.0),
    ]
    _AMENITIES = [
        "wifi",
        "pool",
        "gym",
        "restaurant",
        "parking",
        "air_conditioning",
    ]

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.bookings = HotelBookingRepository(db)

    def search(
        self, payload: schemas.HotelSearchRequest
    ) -> schemas.HotelSearchResponse:
        """Return deterministic mock listings seeded by the region id."""
        seed = int(
            hashlib.sha256(str(payload.region_id).encode()).hexdigest(), 16
        )
        hotels: list[schemas.HotelListing] = []
        for index, (name, rating, base_price) in enumerate(self._SAMPLE_NAMES):
            hotel_id = f"htl_{(seed + index) % 1_000_000:06d}"
            if (
                payload.max_price_per_night is not None
                and base_price > payload.max_price_per_night
            ):
                continue
            if payload.min_rating is not None and rating < payload.min_rating:
                continue
            hotels.append(
                schemas.HotelListing(
                    id=hotel_id,
                    name=name,
                    description=f"{name} in the heart of the region.",
                    address="123 Example Street",
                    rating=rating,
                    review_count=100 + index * 37,
                    price_per_night=base_price,
                    currency="USD",
                    room_types=[
                        schemas.RoomType(
                            type="standard", available=True, price=base_price
                        ),
                        schemas.RoomType(
                            type="deluxe",
                            available=True,
                            price=round(base_price * 1.4, 2),
                        ),
                    ],
                    amenities=self._AMENITIES[: 3 + (index % 3)],
                    check_in_time="14:00",
                    check_out_time="11:00",
                    cancellation_policy="Free cancellation up to 24h before check-in.",
                )
            )

        recommendations = [
            schemas.HotelRecommendation(
                hotel_id=hotels[0].id,
                reason="Highest guest rating within your filters.",
            )
        ] if hotels else []
        return schemas.HotelSearchResponse(
            hotels=hotels, recommendations=recommendations
        )

    @staticmethod
    def _price_for(hotel_id: str, room_type: str, nights: int) -> float:
        base = 60.0 + (int(hotel_id.split("_")[-1]) % 140)
        multiplier = 1.4 if room_type.lower() == "deluxe" else 1.0
        return round(base * multiplier * max(nights, 1), 2)

    async def create_booking(
        self, payload: schemas.HotelBookingRequest, user_id: UUID
    ) -> HotelBooking:
        if payload.check_out_date <= payload.check_in_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="check_out_date must be after check_in_date",
            )
        nights = (payload.check_out_date - payload.check_in_date).days
        total = self._price_for(payload.hotel_id, payload.room_type, nights)
        booking = HotelBooking(
            user_id=user_id,
            trip_id=payload.trip_id,
            region_node_id=payload.region_node_id,
            hotel_id=payload.hotel_id,
            hotel_name=payload.hotel_id,
            room_type=payload.room_type,
            check_in_date=payload.check_in_date,
            check_out_date=payload.check_out_date,
            nights=nights,
            guests=payload.guests,
            rooms=payload.rooms,
            total_price=total,
            currency="USD",
            booking_reference=_reference("HTL"),
            confirmation_sent=True,
            cancellation_policy="Free cancellation up to 24h before check-in.",
            special_requests=payload.special_requests,
        )
        return await self.bookings.create(booking)

    async def list_bookings(
        self,
        user_id: UUID,
        trip_id: UUID,
        region_node_id: UUID | None,
        status_filter: str | None,
    ) -> list[HotelBooking]:
        return await self.bookings.list(
            user_id, trip_id, region_node_id, status_filter
        )

    async def get_booking(self, booking_id: UUID, user_id: UUID) -> HotelBooking:
        booking = await self.bookings.get(booking_id, user_id)
        if booking is None:
            raise _not_found(_BOOKING_NOT_FOUND)
        return booking

    async def update_booking(
        self,
        booking_id: UUID,
        payload: schemas.HotelBookingUpdateRequest,
        user_id: UUID,
    ) -> HotelBooking:
        booking = await self.get_booking(booking_id, user_id)
        updates = payload.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(booking, field, value)
        # Recompute nights/total if the date range changed.
        if "check_in_date" in updates or "check_out_date" in updates:
            if booking.check_out_date <= booking.check_in_date:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="check_out_date must be after check_in_date",
                )
            booking.nights = (
                booking.check_out_date - booking.check_in_date
            ).days
            booking.total_price = self._price_for(
                booking.hotel_id, booking.room_type, booking.nights
            )
        await self.db.flush()
        await self.db.refresh(booking)
        return booking

    async def cancel_booking(self, booking_id: UUID, user_id: UUID) -> None:
        booking = await self.get_booking(booking_id, user_id)
        await self.bookings.delete(booking)


class DiningReservationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.reservations = DiningReservationRepository(db)

    async def create(
        self, payload: schemas.DiningReservationRequest, user_id: UUID
    ) -> DiningReservation:
        data = payload.model_dump()
        contact = data.pop("phone", None)
        reservation = DiningReservation(
            user_id=user_id,
            dining_option_name=data.get("dining_option_id"),
            reservation_reference=_reference("DIN"),
            contact_number=contact,
            **data,
        )
        return await self.reservations.create(reservation)

    async def list(
        self,
        user_id: UUID,
        trip_id: UUID,
        region_node_id: UUID | None,
        status_filter: str | None,
    ) -> list[DiningReservation]:
        return await self.reservations.list(
            user_id, trip_id, region_node_id, status_filter
        )

    async def get(
        self, reservation_id: UUID, user_id: UUID
    ) -> DiningReservation:
        reservation = await self.reservations.get(reservation_id, user_id)
        if reservation is None:
            raise _not_found(_RESERVATION_NOT_FOUND)
        return reservation

    async def update(
        self,
        reservation_id: UUID,
        payload: schemas.DiningReservationUpdateRequest,
        user_id: UUID,
    ) -> DiningReservation:
        reservation = await self.get(reservation_id, user_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(reservation, field, value)
        await self.db.flush()
        await self.db.refresh(reservation)
        return reservation

    async def cancel(self, reservation_id: UUID, user_id: UUID) -> None:
        reservation = await self.get(reservation_id, user_id)
        await self.reservations.delete(reservation)
