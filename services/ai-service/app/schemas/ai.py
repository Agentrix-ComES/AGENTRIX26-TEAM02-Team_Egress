"""Schemas for AI orchestration endpoints."""
import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class ItineraryItem(BaseModel):
    """A single timeline entry within a day (hotel, activity, or transport)."""

    type: Literal["hotel", "activity", "transport", "meal"] = "activity"
    time: str | None = None  # e.g. "09:30" or "morning"
    title: str
    location: str | None = None
    notes: str | None = None
    image_url: str | None = Field(
        default=None,
        description="Cover image URL for this item, copied from the retrieved context.",
    )
    website: str | None = Field(
        default=None,
        description="Official website or booking link, copied from the retrieved context.",
    )
    metadata: dict[str, Any] = Field(default_factory=dict)


class ItineraryDay(BaseModel):
    date: str | None = None
    location: str | None = None
    items: list[ItineraryItem] = Field(default_factory=list)


class Itinerary(BaseModel):
    destination: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    days: list[ItineraryDay] = Field(default_factory=list)


class IntentDecision(BaseModel):
    """Structured intent classification result (LLM structured output).

    The LLM classifies intent and, when it can be inferred from the message,
    also extracts destination, start_date, and end_date so downstream nodes
    (retrieve, climate, planner) have the context they need.
    """

    intent: Literal["plan", "modify", "disruption", "chat"]
    destination: str | None = Field(
        default=None,
        description="Destination extracted from the message (e.g. 'Kandy'). Null if not mentioned.",
    )
    start_date: str | None = Field(
        default=None,
        description="Trip start date in ISO format (YYYY-MM-DD) if mentioned. Null otherwise.",
    )
    end_date: str | None = Field(
        default=None,
        description="Trip end date in ISO format (YYYY-MM-DD) if mentioned. Null otherwise.",
    )


class PlannerOutput(BaseModel):
    """Structured planner result: a natural-language reply plus the timeline."""

    reply: str = Field(..., description="Short natural-language summary for the user.")
    itinerary: Itinerary


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="The user's chat message.")
    conversation_id: str | None = Field(
        default=None,
        description="LangGraph thread id; omit to start a new conversation.",
    )
    user_id: str | None = Field(default=None, description="Caller's user id (from the gateway).")
    preferences: list[str] = Field(
        default_factory=list,
        description="Traveller preferences used to bias the plan (e.g. 'budget', 'food').",
    )
    destination: str | None = Field(default=None, description="Optional explicit destination.")
    start_date: str | None = Field(default=None, description="Optional trip start date (ISO).")
    end_date: str | None = Field(default=None, description="Optional trip end date (ISO).")
    disruption: dict[str, Any] | None = Field(
        default=None,
        description="System-detected disruption event; forces a replan of the current trip.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "message": "Plan me 3 relaxed days in Kandy with tea tours and good food.",
                    "preferences": ["nature", "food", "relaxed"],
                }
            ]
        }
    }


class ChatResponse(BaseModel):
    conversation_id: str = Field(..., description="Use this on the next turn to continue.")
    run_id: uuid.UUID = Field(..., description="Persisted orchestration run id.")
    reply: str = Field(..., description="Assistant's natural-language reply.")
    plan_changed: bool = Field(default=False, description="True if the itinerary was created or changed.")
    itinerary: Itinerary | None = Field(default=None, description="Latest itinerary timeline, if any.")


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime | None = None


class ConversationState(BaseModel):
    conversation_id: str
    messages: list[ConversationMessage] = Field(default_factory=list)
    itinerary: Itinerary | None = None


class RunResponse(BaseModel):
    id: uuid.UUID
    run_type: str
    status: str


class ManualUpsertItem(BaseModel):
    """A single record to manually upsert into a Qdrant collection."""

    content: str = Field(
        ...,
        min_length=1,
        description="The natural-language text to embed and store (e.g. a culture note, event description).",
    )
    collection: Literal["hotels", "activities", "transport", "dining", "culture", "events", "destinations"] = Field(
        ..., description="Target Qdrant collection."
    )
    name: str | None = Field(default=None, description="Human-readable name for this record.")
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description=(
            "Additional filterable payload fields. "
            "Useful keys by collection:\n"
            "- culture: site_type, region, religion\n"
            "- events: event_type, month, city, region\n"
            "- destinations: region, best_season, lat, lon\n"
            "- dining: cuisine, city, region, price_tier, dietary\n"
        ),
    )
    id: str | None = Field(
        default=None,
        description="Optional stable record id (UUID string). Auto-generated if omitted. Use the same id to overwrite an existing record.",
    )


class ManualUpsertRequest(BaseModel):
    """Batch request to manually upsert records into the Qdrant knowledge base."""

    items: list[ManualUpsertItem] = Field(..., min_length=1, max_length=500)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "items": [
                        {
                            "collection": "culture",
                            "name": "Temple of the Tooth — Dress Code",
                            "content": "Visitors to the Temple of the Tooth Relic in Kandy must cover their shoulders and knees. Shoes must be removed before entering the inner shrine. Photography is permitted in outer courtyards but not inside the relic chamber.",
                            "metadata": {"site_type": "temple", "region": "Central Province", "religion": "Buddhist"},
                        },
                        {
                            "collection": "events",
                            "name": "Esala Perahera",
                            "content": "The Esala Perahera is a grand Buddhist festival held in Kandy every July or August. The ten-day procession features decorated elephants, traditional dancers, and fire performers. Roads around the temple are closed during the evening processions.",
                            "metadata": {"event_type": "festival", "city": "Kandy", "month": "July"},
                        },
                    ]
                }
            ]
        }
    }


class ManualUpsertResponse(BaseModel):
    upserted: int = Field(..., description="Number of records successfully embedded and upserted.")
    failed: int = Field(default=0, description="Number of records that failed to upsert.")
    collection_summary: dict[str, int] = Field(
        default_factory=dict,
        description="Count of records upserted per collection.",
    )
    trip_id: str | None = None
    output: dict[str, Any] | None = None
    error: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
