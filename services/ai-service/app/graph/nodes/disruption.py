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
    user = (
        f"Disruption: {disruption_text}\n"
        f"Current itinerary: {json.dumps(itinerary, ensure_ascii=False)[:3000]}"
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

