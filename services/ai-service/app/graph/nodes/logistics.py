"""Logistics node: validate feasibility using Neo4j routes."""
from app.graph.state import GraphState
from app.graph.tools.neo4j_routes import find_routes


async def logistics(state: GraphState) -> GraphState:
    destination = state.get("destination", "")
    routes: list[dict] = []
    if destination:
        try:
            routes = await find_routes(origin=destination, destination=destination, limit=5)
        except Exception:
            routes = []
    return {"routes": routes}
