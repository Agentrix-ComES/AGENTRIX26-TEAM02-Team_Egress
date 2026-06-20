"""Route/connection lookups against Neo4j."""
from typing import Any

from app.db.neo4j import get_neo4j

_ROUTE_QUERY = """
MATCH (a:Place {name: $origin})-[r:ROUTE]->(b:Place {name: $destination})
RETURN a.name AS origin, b.name AS destination,
       r.mode AS mode, r.duration_min AS duration_min
ORDER BY r.duration_min ASC
LIMIT $limit
"""


async def find_routes(origin: str, destination: str, limit: int = 5) -> list[dict[str, Any]]:
    """Return candidate routes between two places ordered by duration."""
    driver = get_neo4j()
    async with driver.session() as session:
        result = await session.run(
            _ROUTE_QUERY, origin=origin, destination=destination, limit=limit
        )
        records = await result.data()
    return records
