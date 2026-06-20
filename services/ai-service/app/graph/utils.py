"""Shared helpers for LangGraph nodes."""
from app.graph.state import GraphState


def latest_user_text(state: GraphState) -> str:
    """Return the content of the most recent human/user message, or ''."""
    for message in reversed(state.get("messages", [])):
        content = getattr(message, "content", None)
        if content and getattr(message, "type", "human") in ("human", "user"):
            return str(content)
    return ""
