"""Alerts node: fetch live Sri Lanka travel alerts and inject into graph state.

Runs in parallel with the climate node (after retrieval, before planning) for
plan/modify intents, and always runs before the disruption node when a disruption
is detected. This gives the disruption agent and planner real-world context:
active floods, protests, road closures, or elevated travel advisories that should
influence which activities are scheduled and what warnings are surfaced.

Failures are fully graceful — if all alert sources are down, ``live_alerts``
is set to None and planning proceeds normally without alerts context.
"""
import logging

from app.graph.state import GraphState
from app.services import alerts_service

logger = logging.getLogger(__name__)


async def fetch_alerts(state: GraphState) -> GraphState:
    """Fetch live travel alerts and store in state for downstream nodes."""
    try:
        alerts = await alerts_service.get_alerts(
            include_news=True,
            include_gdacs=True,
            include_advisory=True,
            include_local=False,   # local RSS excluded from agent context (too noisy)
            max_news=8,
        )
        # Only keep high/medium severity alerts in the agent context to avoid
        # overwhelming the prompt with low-severity noise.
        high_medium = [
            a for a in alerts.get("alerts", [])
            if a.get("severity") in ("high", "medium")
        ]
        return {
            "live_alerts": {
                "advisory": alerts.get("advisory"),
                "alerts": high_medium[:10],          # cap at 10 items for prompt budget
                "sources_used": alerts.get("sources_used", []),
            }
        }
    except Exception as exc:
        logger.warning("Alerts fetch failed (non-fatal): %s", exc)
        return {"live_alerts": None}
