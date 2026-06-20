"""Retrieval node: pull semantic context from the multi-collection knowledge base.

This is the advanced RAG step. Based on the conversation intent we fan a single
embedded query out across the relevant Qdrant collections (hotels, activities,
transport, dining, culture, events), optionally filtering by destination city.
We retrieve a larger initial set, then use an LLM to rerank them against the
user's specific preferences, and flatten the top source-tagged hits into 
``state['retrieved']`` for the planner.
"""
import json
import logging
from typing import Any

from app.core.config import settings
from app.db.qdrant_collections import (
    ACTIVITIES,
    CULTURE,
    DINING,
    EVENTS,
    HOTELS,
    TRANSPORT,
)
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.graph.tools.qdrant_search import Filters, multi_search
from app.schemas.ai import RerankedIndices

logger = logging.getLogger(__name__)

# Which collections matter for each intent.
_COLLECTIONS_BY_INTENT: dict[str, tuple[str, ...]] = {
    "plan": (HOTELS, ACTIVITIES, TRANSPORT, DINING, CULTURE, EVENTS),
    "modify": (HOTELS, ACTIVITIES, TRANSPORT, DINING, CULTURE),
    "disruption": (TRANSPORT, ACTIVITIES, EVENTS),
    "chat": (ACTIVITIES, CULTURE),
}
_DEFAULT_COLLECTIONS = (HOTELS, ACTIVITIES, TRANSPORT, DINING, CULTURE)

# Payload fields kept in the compact RAG record handed to the planner. The
# embedded ``content`` gives the LLM meaning; the rest is actionable metadata
# (location, media, price/mode) for building and rendering the itinerary.
_KEEP_FIELDS = (
    "name",
    "content",
    "category",
    "subtype",
    "city",
    "region",
    "address",
    "lat",
    "lon",
    "image_url",
    "website",
    "price_tier",
    "star_rating",
    "indoor_outdoor",
    "mode",
    "opening_hours",
)


def _compact_hit(hit: dict) -> dict:
    """Trim a raw Qdrant hit to a meaningful, RAG-friendly record."""
    payload = hit.get("payload", {})
    record = {k: payload[k] for k in _KEEP_FIELDS if payload.get(k) not in (None, "", [])}
    record["source"] = hit.get("source")
    record["score"] = round(hit.get("score", 0.0), 4)
    return record


async def _rerank_with_llm(query: str, hits: list[dict[str, Any]], top_k: int) -> list[dict[str, Any]]:
    """Use an LLM to rerank the top raw hits against the specific user query."""
    if not hits:
        return []
    
    if len(hits) <= top_k:
        return hits
        
    # Prepare the context dump for the LLM
    context_dump = []
    for idx, hit in enumerate(hits):
        context_dump.append(f"--- Item {idx} ---\nName: {hit.get('name', 'Unknown')}\nSource: {hit.get('source', 'Unknown')}\nContent: {hit.get('content', '')}")
        
    context_str = "\n\n".join(context_dump)
    
    prompt = (
        f"You are a ranking assistant. Rank the following retrieved context items "
        f"based on their relevance to the user's travel preferences and query: '{query}'.\n\n"
        f"Items:\n{context_str}\n\n"
        f"Select the top {top_k} most relevant items and return their indices in order of relevance."
    )
    
    llm = get_chat_model("reranking").with_structured_output(RerankedIndices)
    
    try:
        result = await llm.ainvoke(prompt)
        indices = result.top_5_indices
        
        # Defensively filter bounds and deduplicate
        seen = set()
        valid_indices = []
        for idx in indices:
            if 0 <= idx < len(hits) and idx not in seen:
                valid_indices.append(idx)
                seen.add(idx)
                
        # Fill the remainder if the LLM returned too few
        for idx in range(len(hits)):
            if len(valid_indices) >= top_k:
                break
            if idx not in seen:
                valid_indices.append(idx)
                seen.add(idx)
                
        # Slice to the requested top_k
        final_indices = valid_indices[:top_k]
        return [hits[idx] for idx in final_indices]
        
    except Exception as e:
        logger.error(f"LLM Reranking failed: {e}. Falling back to default Qdrant scoring.", exc_info=True)
        return hits[:top_k]


async def retrieve(state: GraphState) -> GraphState:
    destination = (state.get("destination") or "").strip()
    prefs = " ".join(state.get("preferences", []))
    query = f"{destination} {prefs}".strip() or "travel recommendations"

    intent = state.get("intent", "plan")
    collections = _COLLECTIONS_BY_INTENT.get(intent, _DEFAULT_COLLECTIONS)

    logger.info(f"RAG Query string: '{query}' | Intent: {intent}")

    # We previously filtered strictly by `{"city": destination}` but OSM ingest 
    # data often lacks the `city` payload key, causing 0 hits. We now rely on 
    # vector similarity and the LLM reranking stage to ensure relevance.
    filters = None

    grouped = await multi_search(query, collections=collections, filters=filters)

    # Flatten and sort by Qdrant raw score
    flat = [_compact_hit(hit) for hits in grouped.values() for hit in hits]
    flat.sort(key=lambda h: h["score"], reverse=True)
    
    # 1. Take Top K initial hits
    initial_k = settings.rag_initial_top_k
    top_initial = flat[:initial_k]
    
    logger.info("="*40)
    logger.info(f"RAG Stage 1: Initial Top {initial_k} Results from Vector DB")
    logger.info(json.dumps([{"name": h.get("name"), "score": h.get("score")} for h in top_initial], indent=2))
    
    # 2. Rerank with LLM
    reranked_k = settings.rag_reranked_top_k
    top_reranked = await _rerank_with_llm(query, top_initial, reranked_k)
    
    logger.info("-" * 40)
    logger.info(f"RAG Stage 2: Final Top {reranked_k} Reranked Results (passed to Planner)")
    logger.info(json.dumps([{"name": h.get("name"), "score": h.get("score")} for h in top_reranked], indent=2))
    logger.info("=" * 40)

    return {"retrieved": top_reranked}
