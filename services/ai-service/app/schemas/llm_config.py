"""Schemas for LLM configuration."""
import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class LLMConfigBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    provider: str = Field(default="openai", max_length=50)
    model: str = Field(..., max_length=100)
    temperature: float = Field(default=0.2, ge=0.0, le=2.0)
    max_tokens: int | None = Field(default=None, ge=1)
    is_active: bool = True


class LLMConfigCreate(LLMConfigBase):
    pass


class LLMConfigUpdate(BaseModel):
    provider: str | None = Field(default=None, max_length=50)
    model: str | None = Field(default=None, max_length=100)
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)
    max_tokens: int | None = Field(default=None, ge=1)
    is_active: bool | None = None


class LLMConfigRead(LLMConfigBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
