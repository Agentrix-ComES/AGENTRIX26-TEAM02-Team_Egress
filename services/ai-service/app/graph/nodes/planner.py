"""Planner node: produce or revise a structured day-by-day timeline itinerary."""
import json

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.core.prompts import PLANNER_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.schemas.ai import PlannerOutput


def _conversation_summary(state: GraphState, max_turns: int = 4) -> str:
    """Serialize the last N human+assistant turns for planner context."""
    msgs = state.get("messages") or []
    lines: list[str] = []
    turns_seen = 0
    for msg in reversed(msgs):
        if turns_seen >= max_turns * 2:
            break
        content = str(getattr(msg, "content", ""))[:300].replace("\n", " ")
        if isinstance(msg, HumanMessage):
            lines.append(f"User: {content}")
            turns_seen += 1
        elif isinstance(msg, AIMessage):
            lines.append(f"Assistant: {content}")
            turns_seen += 1
    lines.reverse()
    return "\n".join(lines)


async def plan(state: GraphState) -> GraphState:
    model = get_chat_model("primary").with_structured_output(PlannerOutput)

    # Group retrieved hits by source collection so the LLM gets a structured
    # view (hotels first, then activities, dining, transport, culture/events)
    # rather than a single ranked blob that truncates mid-category.
    retrieved = state.get("retrieved", [])
    grouped: dict[str, list] = {}
    for hit in retrieved:
        src = hit.get("source") or "other"
        grouped.setdefault(src, []).append(hit)
    context = json.dumps(grouped, ensure_ascii=False)[:8000]

    existing = state.get("itinerary")
    intent = state.get("intent", "plan")

    neo4j_places = state.get("neo4j_places") or []
    if neo4j_places:
        places_summary = ", ".join(
            f"{p['name']} ({p.get('type', 'place')}, {p.get('region', '')})"
            for p in neo4j_places
        )
    else:
        places_summary = "none"

    parts = [
        f"Destination: {state.get('destination')}",
        f"Dates: {state.get('start_date')} - {state.get('end_date')}",
        f"Preferences: {', '.join(state.get('preferences', []))}",
        f"Verified locations with transport routes in graph DB: {places_summary}",
        f"Context (grouped by collection): {context}",
    ]

    # Inject conversation history so the planner can avoid repeating suggestions
    # from previous turns and produce a genuinely different itinerary when asked.
    conv = _conversation_summary(state)
    if conv:
        parts.append(f"Conversation history (most recent turns):\n{conv}")
    weather = state.get("weather")
    if weather:
        parts.append(
            "Weather outlook (avoid scheduling weather-sensitive outdoor "
            f"activities on wet/severe days): {json.dumps(weather, ensure_ascii=False)[:1500]}"
        )

    # Inject live alerts so the planner avoids affected areas and surfaces warnings.
    live_alerts = state.get("live_alerts")
    if live_alerts:
        advisory = live_alerts.get("advisory")
        alerts = live_alerts.get("alerts", [])
        if advisory and advisory.get("advisory_level") and int(advisory["advisory_level"]) >= 3:
            parts.append(
                f"TRAVEL ADVISORY ({advisory.get('advisory_label','').upper()}): "
                f"{advisory.get('title')}. {advisory.get('summary') or ''} "
                "Consider flagging this to the traveller."
            )
        if alerts:
            alert_lines = "\n".join(
                f"- [{a.get('severity','?').upper()}] {a.get('title')} ({a.get('source')})"
                for a in alerts[:5]
            )
            parts.append(
                "Live alerts — avoid scheduling activities in affected areas "
                f"and note any relevant warnings in item notes:\n{alert_lines}"
            )
    if existing and intent in ("modify", "disruption"):
        parts.append(
            f"Existing itinerary to revise: {json.dumps(existing, ensure_ascii=False)[:3000]}"
        )
    elif intent == "plan" and conv:
        # Fresh plan but conversation has prior turns — explicitly tell the planner
        # to produce something meaningfully different from what it suggested before.
        parts.append(
            "IMPORTANT: This is a fresh plan request. You MUST produce a genuinely "
            "different itinerary from any previously discussed in this conversation — "
            "vary the specific hotels, restaurants, activities, their ordering, and "
            "day structure. Do not reuse the same suggestions."
        )
    if state.get("disruption"):
        parts.append(
            "Disruption to resolve: "
            + json.dumps(state["disruption"], ensure_ascii=False)
        )
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
