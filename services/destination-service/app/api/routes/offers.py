"""Offers & discounts endpoints."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import OfferService

router = APIRouter(prefix="/regions/{region_id}/offers", tags=["Offers & Discounts"])


@router.get("")
async def list_offers(
    region_id: UUID,
    db: DbSession,
    user: AuthUser,
    category: Annotated[str | None, Query()] = None,
) -> list[schemas.OfferResponse]:
    items = await OfferService(db).list(region_id, category)
    return [schemas.OfferResponse.model_validate(i) for i in items]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_offer(
    region_id: UUID,
    payload: schemas.OfferCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.OfferResponse:
    offer = await OfferService(db).create(region_id, payload)
    return schemas.OfferResponse.model_validate(offer)


@router.patch("/{offer_id}")
async def update_offer(
    region_id: UUID,
    offer_id: str,
    payload: schemas.OfferUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.OfferResponse:
    offer = await OfferService(db).update(region_id, offer_id, payload)
    return schemas.OfferResponse.model_validate(offer)


@router.delete("/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_offer(
    region_id: UUID,
    offer_id: str,
    db: DbSession,
    user: AuthUser,
) -> None:
    await OfferService(db).delete(region_id, offer_id)
