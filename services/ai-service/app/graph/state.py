"""Shared typed state passed between LangGraph nodes."""
from typing import Annotated, Any, TypedDict

from langgraph.graph.message import add_messages


class GraphState(TypedDict, total=False):
    """State object flowing through the planning graph."""

    messages: Annotated[list, add_messages]
    destination: str
    start_date: str | None
    end_date: str | None
    preferences: list[str]
    retrieved: list[dict[str, Any]]
    routes: list[dict[str, Any]]
    itinerary: dict[str, Any]
    disruption: dict[str, Any] | None
    needs_replan: bool
