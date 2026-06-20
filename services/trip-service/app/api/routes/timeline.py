"""Timeline / region node endpoints."""
from uuid import UUID

from fastapi import APIRouter, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import TimelineService

router = APIRouter(prefix="/trips/{trip_id}/timeline", tags=["Timeline"])


@router.get("")
async def get_timeline(
    trip_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.TimelineResponse:
    return await TimelineService(db).get_timeline(trip_id, user.id)


@router.post("/regions", status_code=status.HTTP_201_CREATED)
async def create_region_node(
    trip_id: UUID,
    payload: schemas.RegionNodeCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.RegionNodeResponse:
    node = await TimelineService(db).create_region(trip_id, payload, user.id)
    return schemas.RegionNodeResponse.model_validate(node)


@router.get("/regions/{region_node_id}")
async def get_region_node(
    trip_id: UUID,
    region_node_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.RegionNodeDetailResponse:
    service = TimelineService(db)
    node = await service.get_region(trip_id, region_node_id, user.id)
    return await service.build_region_detail(node)


@router.patch("/regions/{region_node_id}")
async def update_region_node(
    trip_id: UUID,
    region_node_id: UUID,
    payload: schemas.RegionNodeUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.RegionNodeResponse:
    node = await TimelineService(db).update_region(
        trip_id, region_node_id, payload, user.id
    )
    return schemas.RegionNodeResponse.model_validate(node)


@router.delete(
    "/regions/{region_node_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_region_node(
    trip_id: UUID,
    region_node_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> None:
    await TimelineService(db).delete_region(trip_id, region_node_id, user.id)
