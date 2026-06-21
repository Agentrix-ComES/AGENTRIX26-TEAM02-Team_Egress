"""Retrieval node: pull semantic context from the multi-collection knowledge base.

This is the advanced RAG step. Based on the conversation intent we fan a single
embedded query out across the relevant Qdrant collections (hotels, activities,
transport, dining, culture, events), optionally filtering by destination city,
then flatten the source-tagged hits into ``state['retrieved']`` for the planner.

Also fetches Neo4j Place nodes for the destination so the planner can prefer
locations that have verified transport routes in the graph.
"""
import asyncio
import logging

from app.db.qdrant_collections import (
    ACTIVITIES,
    CULTURE,
    DESTINATIONS,
    DINING,
    EVENTS,
    HOTELS,
    TRANSPORT,
)
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.graph.tools.neo4j_routes import find_places
from app.graph.tools.qdrant_search import Filters, multi_search
from app.schemas.ai import RerankedIndices

logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)

# Which collections matter for each intent.
_COLLECTIONS_BY_INTENT: dict[str, tuple[str, ...]] = {
    "plan": (HOTELS, ACTIVITIES, TRANSPORT, DINING, CULTURE, EVENTS, DESTINATIONS),
    "modify": (HOTELS, ACTIVITIES, TRANSPORT, DINING, CULTURE),
    "disruption": (TRANSPORT, ACTIVITIES, EVENTS),
    "chat": (ACTIVITIES, CULTURE, DESTINATIONS),
}
_DEFAULT_COLLECTIONS = (HOTELS, ACTIVITIES, TRANSPORT, DINING, CULTURE, DESTINATIONS)

# Collections whose payload has a ``city`` keyword index for exact-match filtering.
# Transport uses origin/destination; culture uses region; destinations uses region.
# Applying a city filter to these would exclude all their documents.
_CITY_FILTERABLE: frozenset[str] = frozenset({HOTELS, ACTIVITIES, DINING, EVENTS})

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

    # Apply city filter only to collections that index a ``city`` payload field.
    # Transport uses origin/destination; culture/destinations use region — passing
    # a city filter to those collections returns zero results.
    city_filter: Filters | None = {"city": destination} if destination else None
    per_col: dict[str, Filters | None] = {
        c: (city_filter if c in _CITY_FILTERABLE else None) for c in collections
    }

    # Run Qdrant search and Neo4j place lookup concurrently.
    qdrant_task = multi_search(query, collections=collections, per_collection_filters=per_col)
    neo4j_task = find_places(destination)
    grouped, neo4j_places = await asyncio.gather(qdrant_task, neo4j_task, return_exceptions=True)

    if isinstance(grouped, Exception):
        logger.warning("Qdrant search failed: %s", grouped)
        grouped = {}
    if isinstance(neo4j_places, Exception):
        logger.warning("Neo4j place lookup failed: %s", neo4j_places)
        neo4j_places = []

    flat = [_compact_hit(hit) for hits in grouped.values() for hit in hits]
    flat.sort(key=lambda h: h["score"], reverse=True)
    return {"retrieved": flat, "neo4j_places": neo4j_places}
