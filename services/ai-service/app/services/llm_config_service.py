"""LLM configuration service: CRUD over the active LLM config records."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.llm_config import LLMConfig
from app.schemas.llm_config import LLMConfigCreate, LLMConfigUpdate, LLMTier


async def list_configs(
    session: AsyncSession, tier: LLMTier | None = None
) -> list[LLMConfig]:
    stmt = select(LLMConfig)
    if tier is not None:
        stmt = stmt.where(LLMConfig.tier == tier)
    result = await session.execute(stmt.order_by(LLMConfig.created_at.desc()))
    return list(result.scalars().all())


async def get_active_config(
    session: AsyncSession, tier: LLMTier = "primary"
) -> LLMConfig | None:
    result = await session.execute(
        select(LLMConfig)
        .where(LLMConfig.is_active.is_(True), LLMConfig.tier == tier)
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_config(session: AsyncSession, config_id: uuid.UUID) -> LLMConfig | None:
    return await session.get(LLMConfig, config_id)


async def create_config(session: AsyncSession, data: LLMConfigCreate) -> LLMConfig:
    config = LLMConfig(**data.model_dump())
    session.add(config)
    await session.flush()
    return config


async def update_config(
    session: AsyncSession, config_id: uuid.UUID, data: LLMConfigUpdate
) -> LLMConfig | None:
    config = await session.get(LLMConfig, config_id)
    if config is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(config, field, value)
    await session.flush()
    return config
