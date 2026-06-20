"""Weather domain service (Climate & Seasonality).

Wraps the Open-Meteo provider and turns raw forecast data into a compact,
agent-friendly summary: current conditions, a daily outlook, and simple
risk flags (heavy rain / thunderstorms) that the Disruption and Planner nodes
use to avoid scheduling weather-sensitive outdoor activities at bad times.
"""
from __future__ import annotations

from typing import Any

from app.providers import weather_openmeteo as om

# Daily precipitation (mm) above which we consider an outdoor day "wet".
_WET_DAY_MM = 10.0
# WMO codes that indicate severe weather (thunderstorms / violent showers).
_SEVERE_CODES = {82, 95, 96, 99}


def _daily_outlook(daily: dict[str, Any]) -> list[dict[str, Any]]:
    """Zip Open-Meteo's parallel daily arrays into per-day records with flags."""
    dates = daily.get("time") or []
    codes = daily.get("weather_code") or []
    tmax = daily.get("temperature_2m_max") or []
    tmin = daily.get("temperature_2m_min") or []
    psum = daily.get("precipitation_sum") or []
    pprob = daily.get("precipitation_probability_max") or []
    wind = daily.get("wind_speed_10m_max") or []

    out: list[dict[str, Any]] = []
    for i, date in enumerate(dates):
        code = codes[i] if i < len(codes) else None
        rain = psum[i] if i < len(psum) else 0.0
        out.append(
            {
                "date": date,
                "summary": om.describe_code(code),
                "icon_url": om.icon_url(code, is_day=True),
                "weather_code": code,
                "temp_max_c": tmax[i] if i < len(tmax) else None,
                "temp_min_c": tmin[i] if i < len(tmin) else None,
                "precipitation_mm": rain,
                "precipitation_probability": pprob[i] if i < len(pprob) else None,
                "wind_max_kmh": wind[i] if i < len(wind) else None,
                "wet": bool(rain and rain >= _WET_DAY_MM),
                "severe": code in _SEVERE_CODES if code is not None else False,
            }
        )
    return out


async def get_weather_by_coords(
    lat: float, lon: float, *, days: int = 7, place: str | None = None
) -> dict[str, Any]:
    """Return a structured weather summary for a coordinate."""
    raw = await om.forecast(lat, lon, days=days)
    current = raw.get("current") or {}
    is_day = bool(current.get("is_day", 1))
    current_code = current.get("weather_code")
    daily = _daily_outlook(raw.get("daily") or {})
    return {
        "place": place,
        "lat": lat,
        "lon": lon,
        "current": {
            "temperature_c": current.get("temperature_2m"),
            "apparent_temperature_c": current.get("apparent_temperature"),
            "precipitation_mm": current.get("precipitation"),
            "wind_speed_kmh": current.get("wind_speed_10m"),
            "weather_code": current_code,
            "summary": om.describe_code(current_code),
            "icon_url": om.icon_url(current_code, is_day=is_day),
            "is_day": is_day,
        },
        "daily": daily,
        "risk": {
            "wet_days": [d["date"] for d in daily if d["wet"]],
            "severe_days": [d["date"] for d in daily if d["severe"]],
        },
    }


async def get_weather_for_place(
    place: str, *, days: int = 7
) -> dict[str, Any] | None:
    """Geocode a place name (Sri Lanka) and return its weather summary."""
    location = await om.geocode(place)
    if not location:
        return None
    return await get_weather_by_coords(
        location["lat"], location["lon"], days=days, place=location["name"]
    )
