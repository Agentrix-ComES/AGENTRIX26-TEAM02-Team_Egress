"""Build and compile the LangGraph planning workflow."""
from functools import lru_cache
from typing import TYPE_CHECKING

from langgraph.graph import END, START, StateGraph

from app.graph.checkpointer import get_checkpointer
from app.graph.nodes.disruption import handle_disruption
from app.graph.nodes.logistics import logistics
from app.graph.nodes.planner import plan
from app.graph.nodes.retrieve import retrieve
from app.graph.state import GraphState

if TYPE_CHECKING:
    from langgraph.checkpoint.base import BaseCheckpointSaver


def _route_after_logistics(state: GraphState) -> str:
    return "disruption" if state.get("disruption") else END


def build_graph(checkpointer: "BaseCheckpointSaver | None" = None):
    graph = StateGraph(GraphState)

    graph.add_node("retrieve", retrieve)
    graph.add_node("planner", plan)
    graph.add_node("logistics", logistics)
    graph.add_node("disruption", handle_disruption)

    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", "planner")
    graph.add_edge("planner", "logistics")
    graph.add_conditional_edges(
        "logistics",
        _route_after_logistics,
        {"disruption": "disruption", END: END},
    )
    graph.add_edge("disruption", END)

    return graph.compile(checkpointer=checkpointer)


@lru_cache
def get_compiled_graph():
    """Return the compiled graph backed by the Postgres checkpointer.

    Requires ``init_checkpointer()`` to have run on startup.
    """
    return build_graph(checkpointer=get_checkpointer())
