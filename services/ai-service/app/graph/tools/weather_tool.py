
from __future__ import annotations

from typing import Any

from app.services import weather_service


async def weather_for_place(place: str, days: int = 5) -> dict[str, Any] | None:

    if not place:
        return None
    return await weather_service.get_weather_for_place(place, days=days)
