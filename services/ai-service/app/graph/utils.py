from langchain_core.messages import HumanMessage

from app.graph.state import GraphState


def latest_user_text(state: GraphState) -> str:
    for message in reversed(state.get("messages", [])):
        if isinstance(message, HumanMessage):
            content = getattr(message, "content", None)
            if content:
                return str(content)
    return ""
