"""Retrieval node: pull semantic context from Qdrant before planning."""
from app.graph.state import GraphState
from app.graph.tools.qdrant_search import qdrant_search


async def retrieve(state: GraphState) -> GraphState:
    destination = state.get("destination", "")
    prefs = " ".join(state.get("preferences", []))
    query = f"{destination} {prefs}".strip() or "travel recommendations"
    retrieved = await qdrant_search(query, limit=5)
    return {"retrieved": retrieved}
