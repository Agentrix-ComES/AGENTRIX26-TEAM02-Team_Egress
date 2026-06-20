"""Disruption node: analyze a disruption against the current itinerary.

Runs before the planner when an existing trip is disrupted. It produces a short
analysis of what is affected; the planner then rebuilds the affected parts of the
timeline.
"""
import json

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.prompts import DISRUPTION_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.graph.utils import latest_user_text


async def handle_disruption(state: GraphState) -> GraphState:
    disruption = state.get("disruption") or latest_user_text(state)
    itinerary = state.get("itinerary", {})

    model = get_chat_model("secondary")
    disruption_text = (
        json.dumps(disruption, ensure_ascii=False)
        if isinstance(disruption, dict)
        else str(disruption)
    )

    # Include live alerts so the disruption agent knows about active advisories,
    # disasters, or news events that may be compounding the disruption.
    live_alerts = state.get("live_alerts")
    alerts_section = ""
    if live_alerts:
        advisory = live_alerts.get("advisory")
        alerts = live_alerts.get("alerts", [])
        if advisory:
            level = advisory.get("advisory_label", "unknown").upper()
            alerts_section += f"\nTravel Advisory: {level} — {advisory.get('title')}. {advisory.get('summary') or ''}"
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
    }

