"""Planner node: produce or revise a structured day-by-day timeline itinerary."""
import json

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.core.prompts import PLANNER_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.schemas.ai import PlannerOutput


async def plan(state: GraphState) -> GraphState:
    model = get_chat_model("primary").with_structured_output(PlannerOutput)
    context = json.dumps(state.get("retrieved", []), ensure_ascii=False)[:4000]
    existing = state.get("itinerary")
    intent = state.get("intent", "plan")

    parts = [
        f"Destination: {state.get('destination')}",
        f"Dates: {state.get('start_date')} - {state.get('end_date')}",
        f"Preferences: {', '.join(state.get('preferences', []))}",
        f"Context: {context}",
    ]
    if existing and intent in ("modify", "disruption"):
        parts.append(
            f"Existing itinerary to revise: {json.dumps(existing, ensure_ascii=False)[:3000]}"
        )
    if state.get("disruption"):
        parts.append(f"Disruption to resolve: {json.dumps(state['disruption'], ensure_ascii=False)}")
    if state.get("disruption_analysis"):
        parts.append(f"Disruption analysis: {state['disruption_analysis']}")

    result: PlannerOutput = await model.ainvoke(
        [SystemMessage(content=PLANNER_SYSTEM_PROMPT), HumanMessage(content="\n".join(parts))]
    )
    return {
        "itinerary": result.itinerary.model_dump(),
        "plan_changed": True,
        "reply": result.reply,
        "messages": [AIMessage(content=result.reply)],
    }
