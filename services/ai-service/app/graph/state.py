"""Shared typed state passed between LangGraph nodes."""
from typing import Annotated, Any, Literal, TypedDict

from langgraph.graph.message import add_messages

Intent = Literal["plan", "modify", "disruption", "chat"]


class GraphState(TypedDict, total=False):
    """State object flowing through the planning graph."""

    messages: Annotated[list, add_messages]
    is_safe: bool
    intent: Intent
    destination: str
    start_date: str | None
    end_date: str | None
    preferences: list[str]
    retrieved: list[dict[str, Any]]
    routes: list[dict[str, Any]]
    weather: dict[str, Any] | None
    # Live travel alerts (Guardian news, GDACS, US State Dept advisory).
    # Fetched once per planning run and injected into the disruption + planner
    # prompts so decisions reflect real-world conditions.
    live_alerts: dict[str, Any] | None
    itinerary: dict[str, Any]
    disruption: dict[str, Any] | None
    disruption_analysis: str
    plan_changed: bool
    reply: str
