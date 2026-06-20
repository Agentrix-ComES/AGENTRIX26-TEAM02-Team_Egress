"""Qdrant client and collection bootstrap for semantic retrieval."""
import logging

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as qmodels

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: AsyncQdrantClient | None = None


def get_qdrant() -> AsyncQdrantClient:
    """Return a singleton async Qdrant client."""
    global _client
    if _client is None:
        _client = AsyncQdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
            api_key=settings.qdrant_api_key,
        )
    return _client


async def init_qdrant() -> None:
    """Ensure the travel-items collection exists with the right vector size."""
    client = get_qdrant()
    existing = await client.get_collections()
    names = {c.name for c in existing.collections}
    if settings.qdrant_collection_travel not in names:
        await client.create_collection(
            collection_name=settings.qdrant_collection_travel,
            vectors_config=qmodels.VectorParams(
                size=settings.embedding_dim,
                distance=qmodels.Distance.COSINE,
            ),
        )
        logger.info("Created Qdrant collection '%s'", settings.qdrant_collection_travel)


async def close_qdrant() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None
