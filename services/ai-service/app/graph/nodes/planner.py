"""Planner node: produce a day-by-day itinerary from context."""
import json

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.prompts import PLANNER_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState


async def plan(state: GraphState) -> GraphState:
    model = get_chat_model()
    context = json.dumps(state.get("retrieved", []), ensure_ascii=False)[:4000]
    user = (
        f"Destination: {state.get('destination')}\n"
        f"Dates: {state.get('start_date')} - {state.get('end_date')}\n"
        f"Preferences: {', '.join(state.get('preferences', []))}\n"
        f"Context: {context}"
    )
    response = await model.ainvoke(
        [SystemMessage(content=PLANNER_SYSTEM_PROMPT), HumanMessage(content=user)]
    )
    itinerary = {"summary": response.content}
    return {"itinerary": itinerary, "messages": [response]}
