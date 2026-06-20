"""Schemas for AI orchestration endpoints."""
import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    trip_id: str | None = None
    user_id: str | None = None


class ChatResponse(BaseModel):
    run_id: uuid.UUID
    reply: str


class PlanRequest(BaseModel):
    destination: str
    start_date: str | None = None
    end_date: str | None = None
    preferences: list[str] = Field(default_factory=list)
    user_id: str | None = None


class DisruptionRequest(BaseModel):
    trip_id: str
    event_type: str  # weather | transport | closure
    description: str
    user_id: str | None = None


class RetrievalRequest(BaseModel):
    query: str = Field(..., min_length=1)
    limit: int = Field(default=5, ge=1, le=50)


class RetrievalResult(BaseModel):
    id: str
    score: float
    payload: dict[str, Any] = Field(default_factory=dict)


class RunResponse(BaseModel):
    id: uuid.UUID
    run_type: str
    status: str
    trip_id: str | None = None
    output: dict[str, Any] | None = None
    error: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
