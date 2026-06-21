from functools import lru_cache
from typing import TYPE_CHECKING

from langgraph.graph import END, START, StateGraph

from app.graph.checkpointer import get_checkpointer
from app.graph.nodes.alerts import fetch_alerts
from app.graph.nodes.chat import chat
from app.graph.nodes.climate import climate
from app.graph.nodes.disruption import handle_disruption
from app.graph.nodes.intent import classify_intent
from app.graph.nodes.logistics import logistics
from app.graph.nodes.planner import plan
from app.graph.nodes.retrieve import retrieve
from app.graph.state import GraphState

if TYPE_CHECKING:
    from langgraph.checkpoint.base import BaseCheckpointSaver


def _retry_kwargs() -> dict:

    import inspect

    try:
        from langgraph.types import RetryPolicy
    except Exception: 
        try:
            from langgraph.pregel import RetryPolicy  # type: ignore
        except Exception:
            return {}

    params = inspect.signature(StateGraph.add_node).parameters
    policy = RetryPolicy(max_attempts=3)
    if "retry_policy" in params:
        return {"retry_policy": policy}
    if "retry" in params:
        return {"retry": policy}
    return {}


def _route_on_intent(state: GraphState) -> str:
    intent = state.get("intent", "chat")
    if intent == "disruption":
        return "disruption"
    if intent in ("plan", "modify"):
        return "retrieve"
    return "chat"


def build_graph(checkpointer: "BaseCheckpointSaver | None" = None):
    graph = StateGraph(GraphState)
    retry = _retry_kwargs()

    graph.add_node("intent", classify_intent, **retry)
    graph.add_node("chat", chat, **retry)
    graph.add_node("disruption", handle_disruption, **retry)
    graph.add_node("retrieve", retrieve, **retry)
    graph.add_node("climate", climate, **retry)
    graph.add_node("alerts", fetch_alerts, **retry)
    graph.add_node("planner", plan, **retry)
    graph.add_node("logistics", logistics, **retry)

    graph.add_edge(START, "intent")
    graph.add_conditional_edges(
        "intent",
        _route_on_intent,
        {"disruption": "disruption", "retrieve": "retrieve", "chat": "chat"},
    )

    # Disruption is analyzed first, then flows into retrieval for replanning.
    graph.add_edge("disruption", "retrieve")

    graph.add_edge("retrieve", "climate")
    graph.add_edge("retrieve", "alerts")

    # Both parallel nodes must complete before the planner runs.
    graph.add_edge("climate", "planner")
    graph.add_edge("alerts", "planner")

    graph.add_edge("planner", "logistics")
    graph.add_edge("logistics", END)
    graph.add_edge("chat", END)

    return graph.compile(checkpointer=checkpointer)


@lru_cache
def get_compiled_graph():

    return build_graph(checkpointer=get_checkpointer())
