"""Qdrant client and collection bootstrap for semantic retrieval."""
import logging

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as qmodels

from app.core.config import settings
from app.db.qdrant_collections import COLLECTION_SPECS, CollectionSpec

logger = logging.getLogger(__name__)

_client: AsyncQdrantClient | None = None


def get_qdrant() -> AsyncQdrantClient:
    """Return a singleton async Qdrant client."""
    global _client
    if _client is None:
        _client = AsyncQdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
            grpc_port=settings.qdrant_grpc_port,
            prefer_grpc=settings.qdrant_prefer_grpc,
            api_key=settings.qdrant_api_key,
            https=settings.qdrant_https,
        )
    return _client


async def _ensure_payload_indexes(
    client: AsyncQdrantClient, spec: CollectionSpec
) -> None:
    """Create the filterable payload indexes declared on a collection spec."""
    plan: list[tuple[str, qmodels.PayloadSchemaType]] = []
    plan += [(f, qmodels.PayloadSchemaType.KEYWORD) for f in spec.keyword_indexes]
    plan += [(f, qmodels.PayloadSchemaType.INTEGER) for f in spec.integer_indexes]
    plan += [(f, qmodels.PayloadSchemaType.FLOAT) for f in spec.float_indexes]
    for field_name, field_schema in plan:
        try:
            await client.create_payload_index(
                collection_name=spec.name,
                field_name=field_name,
                field_schema=field_schema,
            )
        except Exception:  # noqa: BLE001 - index may already exist; idempotent setup
            logger.debug(
                "Payload index '%s' on '%s' already present", field_name, spec.name
            )


async def init_qdrant() -> None:
    """Ensure every knowledge-base collection exists with vectors + payload indexes."""
    client = get_qdrant()
    existing = await client.get_collections()
    names = {c.name for c in existing.collections}

    for spec in COLLECTION_SPECS:
        if spec.name not in names:
            await client.create_collection(
                collection_name=spec.name,
                vectors_config=qmodels.VectorParams(
                    size=settings.embedding_dim,
                    distance=qmodels.Distance.COSINE,
                    # Keep vectors in memory for fast, accurate ANN search.
                    on_disk=False,
                ),
                # Tune the HNSW graph for higher recall/accuracy.
                hnsw_config=qmodels.HnswConfigDiff(
                    m=settings.qdrant_hnsw_m,
                    ef_construct=settings.qdrant_hnsw_ef_construct,
                ),
                # Store payload on disk; only indexed fields stay hot for filtering.
                on_disk_payload=True,
            )
            logger.info("Created Qdrant collection '%s'", spec.name)
        await _ensure_payload_indexes(client, spec)


async def close_qdrant() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None
