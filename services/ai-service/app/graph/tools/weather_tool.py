"""Graph tool: fetch a weather summary for use inside LangGraph nodes."""
from __future__ import annotations

from typing import Any

from app.services import weather_service


async def weather_for_place(place: str, days: int = 5) -> dict[str, Any] | None:
    """Return a compact weather summary for a place name (Sri Lanka-scoped)."""
    if not place:
        return None
    return await weather_service.get_weather_for_place(place, days=days)
