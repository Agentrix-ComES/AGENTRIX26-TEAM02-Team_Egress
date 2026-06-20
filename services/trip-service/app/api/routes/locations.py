"""Selected-location endpoints (references to the Destination catalog)."""
from uuid import UUID

from fastapi import APIRouter, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import SelectedLocationService

router = APIRouter(
    prefix="/trips/{trip_id}/timeline/regions/{region_node_id}/locations/selected",
    tags=["Selected Locations"],
)


@router.get("")
async def get_selected_locations(
    trip_id: UUID,
    region_node_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> list[schemas.SelectedLocationResponse]:
    items = await SelectedLocationService(db).list(trip_id, region_node_id, user.id)
    return [schemas.SelectedLocationResponse.model_validate(i) for i in items]


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_selected_location(
    trip_id: UUID,
    region_node_id: UUID,
    payload: schemas.SelectedLocationCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.SelectedLocationResponse:
    location = await SelectedLocationService(db).add(
        trip_id, region_node_id, payload, user.id
    )
    return schemas.SelectedLocationResponse.model_validate(location)


@router.patch("/{location_id}")
async def update_selected_location(
    trip_id: UUID,
    region_node_id: UUID,
    location_id: str,
    payload: schemas.SelectedLocationUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.SelectedLocationResponse:
    location = await SelectedLocationService(db).update(
        trip_id, region_node_id, location_id, payload, user.id
    )
    return schemas.SelectedLocationResponse.model_validate(location)


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_selected_location(
    trip_id: UUID,
    region_node_id: UUID,
    location_id: str,
    db: DbSession,
    user: AuthUser,
) -> None:
    await SelectedLocationService(db).remove(
        trip_id, region_node_id, location_id, user.id
    )
