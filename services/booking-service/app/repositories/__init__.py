"""Data-access layer for the Booking Service."""
from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import DiningReservation, HotelBooking, TransportBooking


class TransportBookingRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, booking: TransportBooking) -> TransportBooking:
        self.db.add(booking)
        await self.db.flush()
        await self.db.refresh(booking)
        return booking

    async def get(
        self, booking_id: UUID, user_id: UUID
    ) -> TransportBooking | None:
        result = await self.db.execute(
            select(TransportBooking).where(
                TransportBooking.id == booking_id,
                TransportBooking.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        user_id: UUID,
        trip_id: UUID,
        region_node_id: UUID | None,
        booking_status: str | None,
    ) -> list[TransportBooking]:
        base = select(TransportBooking).where(
            TransportBooking.user_id == user_id,
            TransportBooking.trip_id == trip_id,
        )
        if region_node_id is not None:
            base = base.where(TransportBooking.region_node_id == region_node_id)
        if booking_status is not None:
            base = base.where(TransportBooking.booking_status == booking_status)
        result = await self.db.execute(
            base.order_by(TransportBooking.departure_time)
        )
        return list(result.scalars().all())

    async def delete(self, booking: TransportBooking) -> None:
        await self.db.delete(booking)


class HotelBookingRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, booking: HotelBooking) -> HotelBooking:
        self.db.add(booking)
        await self.db.flush()
        await self.db.refresh(booking)
        return booking

    async def get(self, booking_id: UUID, user_id: UUID) -> HotelBooking | None:
        result = await self.db.execute(
            select(HotelBooking).where(
                HotelBooking.id == booking_id,
                HotelBooking.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        user_id: UUID,
        trip_id: UUID,
        region_node_id: UUID | None,
        status: str | None,
    ) -> list[HotelBooking]:
        base = select(HotelBooking).where(
            HotelBooking.user_id == user_id,
            HotelBooking.trip_id == trip_id,
        )
        if region_node_id is not None:
            base = base.where(HotelBooking.region_node_id == region_node_id)
        if status is not None:
            base = base.where(HotelBooking.status == status)
        result = await self.db.execute(base.order_by(HotelBooking.check_in_date))
        return list(result.scalars().all())

    async def delete(self, booking: HotelBooking) -> None:
        await self.db.delete(booking)


class DiningReservationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(
        self, reservation: DiningReservation
    ) -> DiningReservation:
        self.db.add(reservation)
        await self.db.flush()
        await self.db.refresh(reservation)
        return reservation

    async def get(
        self, reservation_id: UUID, user_id: UUID
    ) -> DiningReservation | None:
        result = await self.db.execute(
            select(DiningReservation).where(
                DiningReservation.id == reservation_id,
                DiningReservation.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        user_id: UUID,
        trip_id: UUID,
        region_node_id: UUID | None,
        status: str | None,
    ) -> list[DiningReservation]:
        base = select(DiningReservation).where(
            DiningReservation.user_id == user_id,
            DiningReservation.trip_id == trip_id,
        )
        if region_node_id is not None:
            base = base.where(DiningReservation.region_node_id == region_node_id)
        if status is not None:
            base = base.where(DiningReservation.status == status)
        result = await self.db.execute(base.order_by(DiningReservation.date))
        return list(result.scalars().all())

    async def delete(self, reservation: DiningReservation) -> None:
        await self.db.delete(reservation)
