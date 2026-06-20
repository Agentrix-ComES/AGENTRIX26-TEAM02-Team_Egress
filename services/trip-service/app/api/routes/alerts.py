"""Trip alert endpoints, including disruption propagation analysis."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app import schemas
from app.api.deps import AuthUser, DbSession
from app.services import AlertService

router = APIRouter(prefix="/trips/{trip_id}/alerts", tags=["Trip Alerts"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_alert(
    trip_id: UUID,
    payload: schemas.TripAlertCreateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.TripAlertResponse:
    alert = await AlertService(db).create(trip_id, payload, user.id)
    return schemas.TripAlertResponse.model_validate(alert)


@router.get("")
async def list_alerts(
    trip_id: UUID,
    db: DbSession,
    user: AuthUser,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
) -> list[schemas.TripAlertResponse]:
    items = await AlertService(db).list(trip_id, status_filter, user.id)
    return [schemas.TripAlertResponse.model_validate(i) for i in items]


@router.get("/{alert_id}")
async def get_alert(
    trip_id: UUID,
    alert_id: UUID,
    db: DbSession,
    user: AuthUser,
) -> schemas.TripAlertDetailedResponse:
    service = AlertService(db)
    alert = await service.get(trip_id, alert_id, user.id)
    return await service.build_detail(trip_id, alert)


@router.patch("/{alert_id}/status")
async def update_alert_status(
    trip_id: UUID,
    alert_id: UUID,
    payload: schemas.TripAlertStatusUpdateRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.TripAlertResponse:
    alert = await AlertService(db).update_status(
        trip_id, alert_id, payload.status, user.id
    )
    return schemas.TripAlertResponse.model_validate(alert)


@router.post("/{alert_id}/propagate")
async def propagate_disruption(
    trip_id: UUID,
    alert_id: UUID,
    payload: schemas.DisruptionPropagationRequest,
    db: DbSession,
    user: AuthUser,
) -> schemas.DisruptionPropagationResponse:
    return await AlertService(db).propagate(trip_id, alert_id, payload, user.id)
