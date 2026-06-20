"""Route/connection lookups against Neo4j."""
from typing import Any

from app.db.neo4j import get_neo4j

# Case-insensitive partial-match so "Kandy" matches "Kandy District" etc.
_ROUTE_QUERY = """
MATCH (a:Place)-[r:ROUTE]->(b:Place)
WHERE toLower(a.name) CONTAINS toLower($origin)
  AND toLower(b.name) CONTAINS toLower($destination)
RETURN a.name AS origin, b.name AS destination,
       r.mode AS mode, r.duration_min AS duration_min,
       r.distance_km AS distance_km
ORDER BY r.duration_min ASC
LIMIT $limit
"""

# Fallback: find ANY route out of origin when no direct pair exists.
_OUTBOUND_QUERY = """
MATCH (a:Place)-[r:ROUTE]->(b:Place)
WHERE toLower(a.name) CONTAINS toLower($origin)
RETURN a.name AS origin, b.name AS destination,
       r.mode AS mode, r.duration_min AS duration_min,
       r.distance_km AS distance_km
ORDER BY r.duration_min ASC
LIMIT $limit
"""


async def find_routes(
    origin: str, destination: str, limit: int = 5
) -> list[dict[str, Any]]:
    """Return candidate routes from origin to destination ordered by duration.

    Uses a case-insensitive partial match so planner-produced location names
    (e.g. "Kandy") match Neo4j nodes stored as "Kandy District". Falls back
    to outbound routes from origin if no direct pair is found.
    """
    if not origin or not destination or origin.lower() == destination.lower():
        return []
    driver = get_neo4j()
    async with driver.session() as session:
        result = await session.run(
            _ROUTE_QUERY, origin=origin, destination=destination, limit=limit
        )
        records = await result.data()
        if not records:
            # Fallback: any outbound route from this origin so logistics can
            # still provide some transport context even without an exact match.
            result = await session.run(
                _OUTBOUND_QUERY, origin=origin, limit=limit
            )
            records = await result.data()
    return records


async def find_all_routes(
    location_pairs: list[tuple[str, str]], limit_per_pair: int = 3
) -> dict[str, list[dict[str, Any]]]:
    """Batch-query routes for multiple origin→destination pairs.

    Returns a dict keyed by ``"origin|destination"`` for easy lookup.
    Skips pairs where origin and destination are the same location.
    """
    results: dict[str, list[dict[str, Any]]] = {}
    for origin, destination in location_pairs:
        if origin.lower() == destination.lower():
            continue
        key = f"{origin}|{destination}"
        routes = await find_routes(origin, destination, limit=limit_per_pair)
        results[key] = routes
    return results
