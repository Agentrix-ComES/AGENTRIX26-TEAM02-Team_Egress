"""Activity endpoints."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import ActivityService

router = APIRouter(prefix="/regions/{region_id}/activities", tags=["Activities"])


@router.get("")
async def list_activities(
    region_id: UUID,
    db: DbSession,
    user: AuthUser,
    difficulty: Annotated[str | None, Query()] = None,
) -> list[schemas.ActivityResponse]:
    items = await ActivityService(db).list(region_id, difficulty)
    return [schemas.ActivityResponse.model_validate(i) for i in items]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_activity(
    region_id: UUID,
    payload: schemas.ActivityCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.ActivityResponse:
    activity = await ActivityService(db).create(region_id, payload)
    return schemas.ActivityResponse.model_validate(activity)


@router.patch("/{activity_id}")
async def update_activity(
    region_id: UUID,
    activity_id: str,
    payload: schemas.ActivityUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.ActivityResponse:
    activity = await ActivityService(db).update(region_id, activity_id, payload)
    return schemas.ActivityResponse.model_validate(activity)


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    region_id: UUID,
    activity_id: str,
    db: DbSession,
    user: AuthUser,
) -> None:
    await ActivityService(db).delete(region_id, activity_id)
