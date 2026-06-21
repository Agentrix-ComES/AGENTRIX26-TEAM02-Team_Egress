"""Disruption node: analyze a disruption against the current itinerary.

Runs before the planner when an existing trip is disrupted. It produces a short
analysis of what is affected; the planner then rebuilds the affected parts of the
timeline.

NOTE on graph ordering: the alerts node runs AFTER retrieve (in the plan/modify
path), so for the disruption path (intent → disruption → retrieve → ...) live
alerts are not yet in state when this node executes. We fetch them inline so the
disruption analysis always reflects real-world conditions.
"""
import json
import logging

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.prompts import DISRUPTION_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.graph.utils import latest_user_text
from app.services import alerts_service

logger = logging.getLogger(__name__)


async def _fetch_alerts_inline() -> dict | None:
    """Fetch live alerts for the disruption node when not already in state."""
    try:
        raw = await alerts_service.get_alerts(
            include_news=True,
            include_gdacs=True,
            include_advisory=True,
            include_local=False,
            max_news=8,
        )
        high_medium = [
            a for a in raw.get("alerts", [])
            if a.get("severity") in ("high", "medium")
        ]
        return {
            "advisory": raw.get("advisory"),
            "alerts": high_medium[:10],
            "sources_used": raw.get("sources_used", []),
        }
    except Exception as exc:
        logger.warning("Inline alerts fetch failed in disruption node: %s", exc)
        return None


async def handle_disruption(state: GraphState) -> GraphState:
    disruption = state.get("disruption") or latest_user_text(state)
    itinerary = state.get("itinerary", {})

    model = get_chat_model("secondary")
    disruption_text = (
        json.dumps(disruption, ensure_ascii=False)
        if isinstance(disruption, dict)
        else str(disruption)
    )

    # The disruption path runs BEFORE the alerts node, so live_alerts in state
    # is either absent or stale from a previous conversation turn.  Always fetch
    # fresh alerts here; fall back to state only when the live fetch fails.
    live_alerts = await _fetch_alerts_inline() or state.get("live_alerts")
    alerts_section = ""
    if live_alerts:
        advisory = live_alerts.get("advisory")
        alerts = live_alerts.get("alerts", [])
        if advisory:
            level = advisory.get("advisory_label", "unknown").upper()
            alerts_section += (
                f"\nTravel Advisory: {level} — "
                f"{advisory.get('title')}. {advisory.get('summary') or ''}"
            )
        if alerts:
            alerts_section += "\nActive alerts (high/medium severity):\n" + "\n".join(
                f"- [{a.get('severity','?').upper()}] {a.get('title')} ({a.get('source')})"
                for a in alerts[:5]
            )

    user = (
        f"Disruption: {disruption_text}\n"
        f"Current itinerary: {json.dumps(itinerary, ensure_ascii=False)[:3000]}"
        + alerts_section
    )
    response = await model.ainvoke(
        [SystemMessage(content=DISRUPTION_SYSTEM_PROMPT), HumanMessage(content=user)]
    )

    # Record the analysis and normalize the disruption payload; the planner
    # consumes both to rebuild the affected parts of the timeline.
    return {
        "disruption_analysis": str(response.content),
        "disruption": disruption if isinstance(disruption, dict) else {"description": disruption},
        "live_alerts": live_alerts,
    }
