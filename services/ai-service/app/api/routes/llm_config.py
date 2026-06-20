import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import SessionDep
from app.schemas.llm_config import LLMConfigCreate, LLMConfigRead, LLMConfigUpdate, LLMTier
from app.services import llm_config_service

router = APIRouter(prefix="/llm-config", tags=["llm-config"])


@router.get("", response_model=list[LLMConfigRead], summary="List LLM configurations")
async def list_configs(
    session: SessionDep, tier: LLMTier | None = None
) -> list[LLMConfigRead]:
    """List configurations, optionally filtered by tier (primary/secondary/tertiary/embedding)."""
    configs = await llm_config_service.list_configs(session, tier=tier)
    return [LLMConfigRead.model_validate(c) for c in configs]


@router.get(
    "/active",
    response_model=LLMConfigRead,
    summary="Get the active LLM configuration for a tier",
)
async def get_active(session: SessionDep, tier: LLMTier = "primary") -> LLMConfigRead:
    config = await llm_config_service.get_active_config(session, tier=tier)
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active LLM config for tier '{tier}'",
        )
    return LLMConfigRead.model_validate(config)


@router.post(
    "",
    response_model=LLMConfigRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an LLM configuration",
)
async def create_config(data: LLMConfigCreate, session: SessionDep) -> LLMConfigRead:
    config = await llm_config_service.create_config(session, data)
    return LLMConfigRead.model_validate(config)


@router.put(
    "/{config_id}",
    response_model=LLMConfigRead,
    summary="Update an LLM configuration",
)
async def update_config(
    config_id: uuid.UUID, data: LLMConfigUpdate, session: SessionDep
) -> LLMConfigRead:
    config = await llm_config_service.update_config(session, config_id, data)
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="LLM config not found"
        )
    return LLMConfigRead.model_validate(config)
