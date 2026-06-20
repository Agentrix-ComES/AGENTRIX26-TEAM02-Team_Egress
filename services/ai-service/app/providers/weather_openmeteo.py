"""Open-Meteo provider: keyless geocoding + weather forecast.

Open-Meteo needs no API key and allows caching, which makes it ideal for the
Climate & Seasonality and Disruption agents. Geocoding turns a place name
("Kandy") into coordinates; the forecast endpoint returns current conditions
plus a daily outlook used to flag weather-sensitive activities.
"""
from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.providers.base import fetch_json

# Open-Meteo WMO weather codes → human-readable summaries.
WMO_CODES: dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def describe_code(code: int | None) -> str:
    """Map a WMO weather code to a short description."""
    if code is None:
        return "Unknown"
    return WMO_CODES.get(int(code), "Unknown")


# WMO code → basmilius weather-icon name (day/night variants where relevant).
# Open-Meteo provides no hosted icons, so we map codes to a free, CDN-served
# SVG icon set (jsDelivr) and build a stable image URL the UI can render.
_ICON_BASE = "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all"
_ICON_NAMES: dict[int, tuple[str, str]] = {
    # code: (day_icon, night_icon)
    0: ("clear-day", "clear-night"),
    1: ("clear-day", "clear-night"),
    2: ("partly-cloudy-day", "partly-cloudy-night"),
    3: ("overcast", "overcast"),
    45: ("fog", "fog"),
    48: ("fog", "fog"),
    51: ("drizzle", "drizzle"),
    53: ("drizzle", "drizzle"),
    55: ("drizzle", "drizzle"),
    61: ("rain", "rain"),
    63: ("rain", "rain"),
    65: ("rain", "rain"),
    71: ("snow", "snow"),
    73: ("snow", "snow"),
    75: ("snow", "snow"),
    80: ("partly-cloudy-day-rain", "partly-cloudy-night-rain"),
    81: ("rain", "rain"),
    82: ("rain", "rain"),
    95: ("thunderstorms", "thunderstorms"),
    96: ("thunderstorms-rain", "thunderstorms-rain"),
    99: ("thunderstorms-rain", "thunderstorms-rain"),
}


def icon_url(code: int | None, *, is_day: bool = True) -> str:
    """Return a CDN URL for a weather icon matching a WMO code + day/night."""
    day_name, night_name = _ICON_NAMES.get(
        int(code) if code is not None else -1, ("not-available", "not-available")
    )
    name = day_name if is_day else night_name
    return f"{_ICON_BASE}/{name}.svg"



async def geocode(name: str, *, country_code: str = "LK") -> dict[str, Any] | None:
    """Resolve a place name to coordinates via Open-Meteo geocoding.

    Defaults to Sri Lanka (``LK``). Returns the top match or ``None``.
    """
    data = await fetch_json(
        "GET",
        settings.openmeteo_geocoding_url,
        params={"name": name, "count": 1, "language": "en", "format": "json"},
        cache_namespace="openmeteo:geocode",
        cache_ttl=settings.cache_ttl_geocode,
        cache_payload={"name": name.lower(), "cc": country_code},
    )
    results = (data or {}).get("results") or []
    # Prefer a result in the requested country when available.
    chosen = next(
        (r for r in results if r.get("country_code") == country_code), results[0] if results else None
    )
    if not chosen:
        return None
    return {
        "name": chosen.get("name"),
        "lat": chosen.get("latitude"),
        "lon": chosen.get("longitude"),
        "country": chosen.get("country"),
        "admin1": chosen.get("admin1"),
    }


async def forecast(
    lat: float,
    lon: float,
    *,
    days: int = 7,
) -> dict[str, Any]:
    """Return current weather + a daily forecast for a coordinate."""
    data = await fetch_json(
        "GET",
        settings.openmeteo_forecast_url,
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day",
            "daily": (
                "weather_code,temperature_2m_max,temperature_2m_min,"
                "precipitation_sum,precipitation_probability_max,wind_speed_10m_max"
            ),
            "timezone": "auto",
            "forecast_days": days,
        },
        cache_namespace="openmeteo:forecast",
        cache_ttl=settings.cache_ttl_weather,
        cache_payload={"lat": round(lat, 2), "lon": round(lon, 2), "days": days},
    )
    return data or {}
