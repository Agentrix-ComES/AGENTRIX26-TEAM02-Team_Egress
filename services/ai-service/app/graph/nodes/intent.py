"""Intent node: classify the latest user message to route the graph.

Distinguishes a new plan request, a modification of an existing itinerary, a
disruption that requires replanning, or plain conversation. Uses the model's
structured-output mode so the result is always a valid label.
"""
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.prompts import INTENT_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.graph.utils import latest_user_text
from app.schemas.ai import IntentDecision


async def classify_intent(state: GraphState) -> GraphState:
    # If a disruption payload is attached explicitly, trust it.
    if state.get("disruption"):
        return {"intent": "disruption"}

    text = latest_user_text(state)
    if not text:
        return {"intent": "chat"}

    model = get_chat_model("tertiary").with_structured_output(IntentDecision)
    decision: IntentDecision = await model.ainvoke(
        [SystemMessage(content=INTENT_SYSTEM_PROMPT), HumanMessage(content=text)]
    )
    intent = decision.intent

    # Without an existing itinerary there is nothing to modify or replan.
    if intent in ("modify", "disruption") and not state.get("itinerary"):
        intent = "plan"

    updates: GraphState = {"intent": intent}

    if intent == "plan":
        # Fresh plan: always override destination/dates from the NL extraction so
        # a new request for a different destination is not silently ignored by
        # stale checkpointed state.  Also clear artefacts from the previous plan
        # so the planner starts from a clean slate and the next classify_intent
        # call cannot drift toward "modify" based on a ghost itinerary.
        if decision.destination:
            updates["destination"] = decision.destination
        if decision.start_date:
            updates["start_date"] = decision.start_date
        if decision.end_date:
            updates["end_date"] = decision.end_date
        # Wipe all artefacts from the previous plan so downstream nodes start
        # clean.  retrieve/climate/alerts will repopulate their fields, but if
        # any of them fail gracefully the old data must not silently persist.
        updates["itinerary"] = None
        updates["disruption"] = None
        updates["disruption_analysis"] = ""
        updates["plan_changed"] = False
        updates["retrieved"] = []
        updates["neo4j_places"] = []
        updates["routes"] = []
        updates["weather"] = None
        updates["live_alerts"] = None
    else:
        # For modify/chat/disruption: only fill in context not already provided
        # by the API caller or a prior run in this conversation.
        if decision.destination and not state.get("destination"):
            updates["destination"] = decision.destination
        if decision.start_date and not state.get("start_date"):
            updates["start_date"] = decision.start_date
        if decision.end_date and not state.get("end_date"):
            updates["end_date"] = decision.end_date

    return updates

