"""Climate node: attach a real-time weather outlook for the destination.

Runs after retrieval and before planning so the planner can avoid scheduling
weather-sensitive outdoor activities on wet or severe days. Weather is fetched
through the weather domain service (Open-Meteo) and cached; failures degrade
gracefully to ``weather = None`` rather than blocking the plan.
"""
import logging

from app.graph.state import GraphState
from app.graph.tools.weather_tool import weather_for_place

logger = logging.getLogger(__name__)


async def climate(state: GraphState) -> GraphState:
    destination = (state.get("destination") or "").strip()
    if not destination:
        return {"weather": None}
    try:
        summary = await weather_for_place(destination, days=5)
    except Exception as exc:  # noqa: BLE001 - weather is advisory, never fatal
        logger.warning("Weather lookup failed for %s: %s", destination, exc)
        return {"weather": None}
    return {"weather": summary}
