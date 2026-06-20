import json

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.prompts import CHAT_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.graph.utils import latest_user_text


async def chat(state: GraphState) -> GraphState:
    model = get_chat_model("secondary")
    itinerary = state.get("itinerary")
    context = (
        f"Current itinerary: {json.dumps(itinerary, ensure_ascii=False)[:2000]}"
        if itinerary
        else "No itinerary yet."
    )
    user = f"{context}\n\nUser: {latest_user_text(state)}"
    response = await model.ainvoke(
        [SystemMessage(content=CHAT_SYSTEM_PROMPT), HumanMessage(content=user)]
    )
    return {
        "reply": str(response.content),
        "plan_changed": False,
        "messages": [response],
    }
