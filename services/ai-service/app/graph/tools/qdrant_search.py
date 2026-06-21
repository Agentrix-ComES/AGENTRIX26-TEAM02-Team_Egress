from __future__ import annotations

import asyncio
from typing import Any, Mapping, Sequence

from qdrant_client.http import models as qmodels

from app.core.config import settings
from app.db.qdrant import get_qdrant
from app.db.qdrant_collections import collection_name
from app.graph.llm import get_embeddings


FilterValue = str | int | float | bool | Sequence[str | int | float]
Filters = Mapping[str, FilterValue]


def build_filter(filters: Filters | None) -> qmodels.Filter | None:

    if not filters:
        return None
    conditions: list[qmodels.FieldCondition] = []
    for field_name, value in filters.items():
        if value is None:
            continue
        if isinstance(value, (list, tuple, set)):
            match: qmodels.Match = qmodels.MatchAny(any=list(value))
        else:
            match = qmodels.MatchValue(value=value)
        conditions.append(qmodels.FieldCondition(key=field_name, match=match))
    return qmodels.Filter(must=conditions) if conditions else None


async def _embed(query: str) -> list[float]:
    return await get_embeddings().aembed_query(query)


def _search_params() -> qmodels.SearchParams | None:

    ef = settings.qdrant_hnsw_ef_search
    return qmodels.SearchParams(hnsw_ef=ef) if ef else None


def _cosine(a: list[float], b: list[float]) -> float:

    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(y * y for y in b) ** 0.5
    return dot / (na * nb) if na and nb else 0.0


def mmr_rerank(
    query_vector: list[float],
    hits: list[dict[str, Any]],
    *,
    top_k: int,
    lambda_mult: float,
) -> list[dict[str, Any]]:

    candidates = [h for h in hits if h.get("vector")]
    if not candidates:
        return sorted(hits, key=lambda h: h["score"], reverse=True)[:top_k]

    selected: list[dict[str, Any]] = []
    remaining = candidates[:]
    while remaining and len(selected) < top_k:
        best, best_score = None, float("-inf")
        for cand in remaining:
            relevance = _cosine(query_vector, cand["vector"])
            redundancy = max(
                (_cosine(cand["vector"], s["vector"]) for s in selected), default=0.0
            )
            mmr = lambda_mult * relevance - (1 - lambda_mult) * redundancy
            if mmr > best_score:
                best, best_score = cand, mmr
        selected.append(best)
        remaining.remove(best)

    for h in selected:
        h.pop("vector", None)
    return selected


async def _search_with_vector(
    collection_key: str,
    vector: list[float],
    *,
    limit: int,
    filters: Filters | None,
    score_threshold: float | None,
    with_vectors: bool = False,
) -> list[dict[str, Any]]:
    client = get_qdrant()
    hits = await client.query_points(
        collection_name=collection_name(collection_key),
        query=vector,
        limit=limit,
        query_filter=build_filter(filters),
        score_threshold=score_threshold,
        search_params=_search_params(),
        with_payload=True,
        with_vectors=with_vectors,
    )
    return [
        {
            "source": collection_key,
            "id": str(point.id),
            "score": point.score,
            "payload": point.payload or {},
            **({"vector": list(point.vector)} if with_vectors and point.vector else {}),
        }
        for point in hits.points
    ]


async def search_collection(
    collection_key: str,
    query: str,
    *,
    limit: int | None = None,
    filters: Filters | None = None,
    score_threshold: float | None = None,
    rerank: bool = True,
) -> list[dict[str, Any]]:

    vector = await _embed(query)
    top_k = limit or settings.qdrant_top_k
    threshold = (
        score_threshold if score_threshold is not None else settings.qdrant_score_threshold
    )
    fetch = top_k * settings.qdrant_overfetch_factor if rerank else top_k
    hits = await _search_with_vector(
        collection_key,
        vector,
        limit=fetch,
        filters=filters,
        score_threshold=threshold,
        with_vectors=rerank,
    )
    if not rerank:
        return hits
    return mmr_rerank(
        vector, hits, top_k=top_k, lambda_mult=settings.qdrant_mmr_lambda
    )


async def multi_search(
    query: str,
    collections: Sequence[str],
    *,
    limit: int | None = None,
    filters: Filters | None = None,
    per_collection_filters: dict[str, Filters | None] | None = None,
    score_threshold: float | None = None,
    rerank: bool = True,
) -> dict[str, list[dict[str, Any]]]:
    """Search multiple Qdrant collections in parallel, sharing one embedding call.

    Args:
        per_collection_filters: Optional per-key filter overrides. When a key is
            present its value replaces the global ``filters`` for that collection
            (pass ``None`` as the value to search a collection without any filter).
            Collections not listed fall back to ``filters``.
    """
    vector = await _embed(query)
    top_k = limit or settings.qdrant_top_k
    threshold = (
        score_threshold if score_threshold is not None else settings.qdrant_score_threshold
    )
    fetch = top_k * settings.qdrant_overfetch_factor if rerank else top_k

    def _filter_for(key: str) -> Filters | None:
        if per_collection_filters and key in per_collection_filters:
            return per_collection_filters[key]
        return filters

    raw = await asyncio.gather(
        *(
            _search_with_vector(
                key,
                vector,
                limit=fetch,
                filters=_filter_for(key),
                score_threshold=threshold,
                with_vectors=rerank,
            )
            for key in collections
        )
    )
    results: list[list[dict[str, Any]]] = []
    for hits in raw:
        if rerank:
            hits = mmr_rerank(
                vector, hits, top_k=top_k, lambda_mult=settings.qdrant_mmr_lambda
            )
        results.append(hits)
    return dict(zip(collections, results))


async def qdrant_search(query: str, limit: int = 5) -> list[dict[str, Any]]:

    grouped = await multi_search(
        query,
        collections=("activities", "hotels"),
        limit=limit,
    )
    flat = [hit for hits in grouped.values() for hit in hits]
    flat.sort(key=lambda h: h["score"], reverse=True)
    return flat[:limit]

