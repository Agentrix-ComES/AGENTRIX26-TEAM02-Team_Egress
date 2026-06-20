"""Retrieval node: pull semantic context from the multi-collection knowledge base.

This is the advanced RAG step. Based on the conversation intent we fan a single
embedded query out across the relevant Qdrant collections (hotels, activities,
transport, dining, culture, events), optionally filtering by destination city,
then flatten the source-tagged hits into ``state['retrieved']`` for the planner.
"""
from app.db.qdrant_collections import (
    ACTIVITIES,
    CULTURE,
    DINING,
    EVENTS,
    HOTELS,
    TRANSPORT,
)
from app.graph.state import GraphState
from app.graph.tools.qdrant_search import Filters, multi_search

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


async def retrieve(state: GraphState) -> GraphState:
    destination = (state.get("destination") or "").strip()
    prefs = " ".join(state.get("preferences", []))
    query = f"{destination} {prefs}".strip() or "travel recommendations"

    intent = state.get("intent", "plan")
    collections = _COLLECTIONS_BY_INTENT.get(intent, _DEFAULT_COLLECTIONS)

    # Lightly bias results to the destination city when we know it. City is a
    # keyword-indexed payload field on hotels/activities/dining/events.
    filters: Filters | None = None

    grouped = await multi_search(query, collections=collections, filters=filters)

    # Flatten into a single ranked list while keeping the `source` collection tag
    # so the planner can tell hotels from transport from cultural notes.
    flat = [_compact_hit(hit) for hits in grouped.values() for hit in hits]
    flat.sort(key=lambda h: h["score"], reverse=True)
    return {"retrieved": flat}

