"""Emergency services endpoints."""
from uuid import UUID

from fastapi import APIRouter, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import EmergencyFacilityService

router = APIRouter(prefix="/regions/{region_id}/emergency", tags=["Emergency Services"])


@router.get("")
async def get_emergency_services(
    region_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.EmergencyServicesResponse:
    return await EmergencyFacilityService(db).aggregate(region_id)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_emergency_service(
    region_id: UUID,
    payload: schemas.EmergencyServiceCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.EmergencyServiceResponse:
    service = await EmergencyFacilityService(db).create(region_id, payload)
    return schemas.EmergencyServiceResponse.model_validate(service)


@router.patch("/{service_id}")
async def update_emergency_service(
    region_id: UUID,
    service_id: UUID,
    payload: schemas.EmergencyServiceUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.EmergencyServiceResponse:
    service = await EmergencyFacilityService(db).update(region_id, service_id, payload)
    return schemas.EmergencyServiceResponse.model_validate(service)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_emergency_service(
    region_id: UUID,
    service_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> None:
    await EmergencyFacilityService(db).delete(region_id, service_id)
