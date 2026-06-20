"""Data routes: real-time weather and content ingestion into Qdrant."""
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Query

from app.services import content_ingest_service, weather_service

router = APIRouter(prefix="/data", tags=["data"])


@router.get(
    "/weather",
    summary="Real-time weather outlook for a place",
    response_description="Current conditions, daily outlook, and risk flags.",
)
async def weather(
    place: str = Query(..., description="Place name, e.g. 'Kandy' (Sri Lanka)"),
    days: int = Query(5, ge=1, le=16, description="Forecast days"),
) -> dict[str, Any]:
    """Geocode a place (Open-Meteo) and return its weather summary."""
    summary = await weather_service.get_weather_for_place(place, days=days)
    if summary is None:
        raise HTTPException(status_code=404, detail=f"Could not locate place: {place!r}")
    return summary


@router.post(
    "/ingest",
    summary="Ingest Sri Lanka POIs from OpenStreetMap into Qdrant",
    response_description="Counts of fetched and upserted items per category.",
)
async def ingest(
    category: Literal["hotels", "activities", "transport", "all"] = Query(
        "all", description="Which content category to ingest"
    ),
    limit: int = Query(200, ge=1, le=2000, description="Max POIs per category"),
) -> dict[str, Any]:
    """Pull POIs from OSM Overpass and upsert them into the matching collection."""
    if category == "all":
        return await content_ingest_service.ingest_all(limit=limit)
    return await content_ingest_service.ingest_category(category, limit=limit)
