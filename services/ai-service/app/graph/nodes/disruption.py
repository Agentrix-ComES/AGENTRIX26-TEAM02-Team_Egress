"""Disruption node: adjust the itinerary for a disruption event."""
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.prompts import DISRUPTION_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState


async def handle_disruption(state: GraphState) -> GraphState:
    disruption = state.get("disruption")
    if not disruption:
        return {"needs_replan": False}

    model = get_chat_model()
    user = (
        f"Disruption: {disruption}\n"
        f"Current itinerary: {state.get('itinerary', {}).get('summary', '')}"
    )
    response = await model.ainvoke(
        [SystemMessage(content=DISRUPTION_SYSTEM_PROMPT), HumanMessage(content=user)]
    )
    itinerary = {"summary": response.content}
    return {"itinerary": itinerary, "needs_replan": False, "messages": [response]}
