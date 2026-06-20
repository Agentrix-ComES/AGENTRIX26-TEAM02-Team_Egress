"""Logistics node: validate and enrich the itinerary using Neo4j routes.

Runs after the planner. It:
1. Extracts the sequence of distinct day-level locations from the planned itinerary.
2. Queries Neo4j for routes between every consecutive location pair.
3. Enriches each transport item in the itinerary with real mode/duration from Neo4j
   where a matching route is found, otherwise leaves the planner's transport item as-is.
"""
import logging
from typing import Any

from app.graph.state import GraphState
from app.graph.tools.neo4j_routes import find_all_routes

logger = logging.getLogger(__name__)


def _ordered_day_locations(itinerary: dict[str, Any]) -> list[str]:
    """Return the unique day locations in itinerary order."""
    seen: set[str] = set()
    locs: list[str] = []
    for day in itinerary.get("days") or []:
        loc = (day.get("location") or "").strip()
        if loc and loc not in seen:
            seen.add(loc)
            locs.append(loc)
    return locs


def _enrich_transport_items(
    itinerary: dict[str, Any],
    route_map: dict[str, list[dict[str, Any]]],
) -> dict[str, Any]:
    """Annotate transport-type items with Neo4j route data (mode + duration).

    Matches a transport item to a route by checking whether the item's location
    or notes mention the origin/destination of any known route. When a match is
    found the item's notes are updated with the validated mode and duration so the
    frontend can display accurate travel information.
    """
    import copy
    itinerary = copy.deepcopy(itinerary)
    for day in itinerary.get("days") or []:
        for item in day.get("items") or []:
            if item.get("type") != "transport":
                continue
            item_text = " ".join(
                str(item.get(f) or "") for f in ("title", "location", "notes")
            ).lower()
            for route_key, routes in route_map.items():
                if not routes:
                    continue
                origin, destination = route_key.split("|", 1)
                if origin.lower() in item_text or destination.lower() in item_text:
                    best = routes[0]
                    mode = best.get("mode") or "transport"
                    duration = best.get("duration_min")
                    dist = best.get("distance_km")
                    parts = [f"Mode: {mode}"]
                    if duration:
                        parts.append(f"~{duration} min")
                    if dist:
                        parts.append(f"{dist} km")
                    item["notes"] = (item.get("notes") or "") + (
                        f" [{', '.join(parts)}]"
                    )
                    break
    return itinerary


async def logistics(state: GraphState) -> GraphState:
    itinerary = state.get("itinerary") or {}
    locs = _ordered_day_locations(itinerary)

    if len(locs) < 2:
        return {"routes": []}

    # Build consecutive pairs: Kandy→Ella, Ella→Mirissa, etc.
    pairs = [(locs[i], locs[i + 1]) for i in range(len(locs) - 1)]

    try:
        route_map = await find_all_routes(pairs, limit_per_pair=3)
    except Exception as exc:
        logger.warning("Neo4j route lookup failed: %s", exc)
        return {"routes": []}

    all_routes = [r for routes in route_map.values() for r in routes]

    # Enrich transport items in the itinerary with verified route data.
    if route_map:
        enriched = _enrich_transport_items(itinerary, route_map)
        return {"routes": all_routes, "itinerary": enriched}

    return {"routes": all_routes}
