"""Semantic search over the Qdrant travel-items collection."""
from typing import Any

from app.core.config import settings
from app.db.qdrant import get_qdrant
from app.graph.llm import get_embeddings


async def qdrant_search(query: str, limit: int = 5) -> list[dict[str, Any]]:
    """Embed the query and return the top matching travel items."""
    embeddings = get_embeddings()
    vector = await embeddings.aembed_query(query)

    client = get_qdrant()
    hits = await client.query_points(
        collection_name=settings.qdrant_collection_travel,
        query=vector,
        limit=limit,
        with_payload=True,
    )
    return [
        {"id": str(point.id), "score": point.score, "payload": point.payload or {}}
        for point in hits.points
    ]
