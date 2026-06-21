from typing import Annotated, Any, Literal, TypedDict

from langgraph.graph.message import add_messages

Intent = Literal["plan", "modify", "disruption", "chat"]


class GraphState(TypedDict, total=False):


    messages: Annotated[list, add_messages]
    intent: Intent
    destination: str
    start_date: str | None
    end_date: str | None
    preferences: list[str]
    retrieved: list[dict[str, Any]]
    neo4j_places: list[dict[str, Any]]
    routes: list[dict[str, Any]]
    weather: dict[str, Any] | None

    live_alerts: dict[str, Any] | None
    itinerary: dict[str, Any]
    disruption: dict[str, Any] | None
    disruption_analysis: str
    plan_changed: bool
    reply: str
