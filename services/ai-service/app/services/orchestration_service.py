
from __future__ import annotations

import json
import logging
import uuid

from langchain_core.messages import AIMessage, HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.graph.builder import get_compiled_graph
from app.models.agent_run import AgentRun
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    ConversationMessage,
    ConversationState,
    Itinerary,
)


def _thread_config(conversation_id: str) -> dict:
    return {"configurable": {"thread_id": conversation_id}}


def _to_itinerary(value: dict | None) -> Itinerary | None:
    if not value:
        return None
    try:
        return Itinerary.model_validate(value)
    except Exception:

        return Itinerary(days=[]) if not isinstance(value, dict) else None


async def run_chat(session: AsyncSession, request: ChatRequest) -> ChatResponse:

    conversation_id = request.conversation_id or request.user_id or str(uuid.uuid4())
    run_type = "disruption" if request.disruption else "chat"

    run = AgentRun(
        run_type=run_type,
        status="running",
        trip_id=None,
        user_id=request.user_id,
        input=request.model_dump(mode="json"),
    )
    session.add(run)
    await session.flush()  # assign run.id

    graph = get_compiled_graph()
    input_state: dict = {
        "messages": [HumanMessage(content=request.message)],
        "preferences": request.preferences,
    }
    if request.destination:
        input_state["destination"] = request.destination
    if request.start_date:
        input_state["start_date"] = request.start_date
    if request.end_date:
        input_state["end_date"] = request.end_date
    if request.disruption:
        input_state["disruption"] = request.disruption

    try:
        config = _thread_config(conversation_id)
        config["run_name"] = "TravelAgentOrchestrator"
        logger.info(f"Starting chat run for user {request.user_id} (Thread: {conversation_id})")
        logger.debug(f"Invoking graph with input state: {input_state}")
        
        # Helper to handle non-serializable objects (like AIMessage)
        def _fallback_serializer(obj):
            return str(obj)

        async for event in graph.astream(input_state, config=config, stream_mode="updates"):
            for node_name, node_output in event.items():
                try:
                    output_str = json.dumps(node_output, default=_fallback_serializer, indent=2)
                except Exception:
                    output_str = str(node_output)
                
                # Truncate extremely long outputs
                if len(output_str) > 1500:
                    output_str = output_str[:1500] + "\n... [truncated]"
                    
                logger.info(f"Node Executed: {node_name}")
                logger.info(f"Output from {node_name}:\n{output_str}")

        logger.info(f"Graph execution completed successfully for conversation {conversation_id}")
        
        # Fetch the fully merged state after execution finishes
        state_snapshot = await graph.aget_state(config)
        result = state_snapshot.values
        
    except Exception as exc:  # persist failure, then surface it
        logger.error(f"Graph execution failed for conversation {conversation_id}: {exc}", exc_info=True)
        run.status = "failed"
        run.error = str(exc)
        await session.flush()
        raise

    reply = result.get("reply") or ""
    itinerary = _to_itinerary(result.get("itinerary"))
    plan_changed = bool(result.get("plan_changed"))

    run.status = "completed"
    run.output = {
        "reply": reply,
        "plan_changed": plan_changed,
        "itinerary": itinerary.model_dump() if itinerary else None,
    }
    await session.flush()

    return ChatResponse(
        conversation_id=conversation_id,
        run_id=run.id,
        reply=reply,
        plan_changed=plan_changed,
        itinerary=itinerary,
    )


async def get_conversation(conversation_id: str) -> ConversationState | None:
    """Read the persisted conversation history + current itinerary."""
    graph = get_compiled_graph()
    snapshot = await graph.aget_state(_thread_config(conversation_id))
    if not snapshot or not snapshot.values:
        return None

    values = snapshot.values
    messages: list[ConversationMessage] = []
    for message in values.get("messages", []):
        if isinstance(message, HumanMessage):
            role = "user"
        elif isinstance(message, AIMessage):
            role = "assistant"
        else:
            continue
        messages.append(ConversationMessage(role=role, content=str(message.content)))

    return ConversationState(
        conversation_id=conversation_id,
        messages=messages,
        itinerary=_to_itinerary(values.get("itinerary")),
    )


async def get_itinerary(conversation_id: str) -> Itinerary | None:
    """Read just the latest itinerary for a conversation."""
    state = await get_conversation(conversation_id)
    return state.itinerary if state else None
