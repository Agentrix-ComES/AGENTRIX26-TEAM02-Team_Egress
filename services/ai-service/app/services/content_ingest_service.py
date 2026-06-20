"""Content ingestion service: external POIs → Qdrant collections.

Pulls real Sri Lanka content from OpenStreetMap (Overpass) and upserts it into
the matching Qdrant collection (``hotels`` / ``activities`` / ``transport``).
Each POI is turned into a short natural-language document, embedded once, and
stored with a filterable payload (city, region, subtype, lat/lon, tags). OSM
ids are hashed into stable point ids so re-running the ingest is idempotent.
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any

from qdrant_client.http import models as qmodels

from app.core.config import settings
from app.db.qdrant import get_qdrant
from app.db.qdrant_collections import ACTIVITIES, HOTELS, TRANSPORT, collection_name
from app.graph.llm import get_embeddings
from app.providers import images_wikimedia as images
from app.providers import osm_overpass as osm
from app.providers.osm_overpass import Category

logger = logging.getLogger(__name__)

# Limit concurrent Wikimedia/Wikidata image lookups to stay polite to the APIs.
_IMAGE_CONCURRENCY = 8

# Map an OSM provider category to its Qdrant collection key.
_CATEGORY_TO_COLLECTION: dict[Category, str] = {
    "hotels": HOTELS,
    "activities": ACTIVITIES,
    "transport": TRANSPORT,
}

# Deterministic namespace so the same OSM id always maps to the same point id.
_OSM_NAMESPACE = uuid.UUID("6f0a3d2e-9b1c-4f8a-bd5e-0a1b2c3d4e5f")

# Maximum number of points stored per category (rule-based cap, no AI).
_CATEGORY_CAPS: dict[str, int] = {
    "hotels": settings.ingest_max_hotels,
    "activities": settings.ingest_max_activities,
    "transport": settings.ingest_max_transport,
}

# --------------------------------------------------------------------------
# Rule-based quality scoring (no AI / no LLM involved).
# Each rule contributes points; POIs below _MIN_QUALITY_SCORE are discarded.
# --------------------------------------------------------------------------
_MIN_QUALITY_SCORE = 2  # must satisfy at least 2 rules to be stored


def _quality_score(poi: dict[str, Any], category: Category) -> int:
    """Return a deterministic quality score based on OSM data richness.

    Rules (each worth 1 point):
      1. Has a non-empty ``name``.
      2. Has at least ``ingest_min_tags`` OSM tags (data completeness proxy).
      3. Has city or region (location context useful for filtering).
      4. Has description, website, or wikidata (enriched / discoverable).
      5. Category bonus: hotel→property_type; activity→subtype/category; transport→mode.
    """
    score = 0
    if poi.get("name"):
        score += 1
    if len(poi.get("tag_keys") or []) >= settings.ingest_min_tags:
        score += 1
    if poi.get("city") or poi.get("region"):
        score += 1
    if poi.get("description") or poi.get("website") or poi.get("wikidata"):
        score += 1
    if category == "hotels" and poi.get("property_type"):
        score += 1
    elif category == "activities" and (poi.get("activity_category") or poi.get("subtype")):
        score += 1
    elif category == "transport" and poi.get("mode"):
        score += 1
    return score


def _filter_pois(pois: list[dict[str, Any]], category: Category) -> list[dict[str, Any]]:
    """Apply rule-based quality gates and the per-category capacity cap.

    Steps (fully deterministic, no AI):
      1. Score every POI with :func:`_quality_score`.
      2. Drop POIs below ``_MIN_QUALITY_SCORE``.
      3. Sort survivors by score descending (best data first).
      4. Truncate to the category capacity cap.
    """
    scored = [(poi, _quality_score(poi, category)) for poi in pois]
    passed = [(poi, s) for poi, s in scored if s >= _MIN_QUALITY_SCORE]
    passed.sort(key=lambda x: x[1], reverse=True)
    cap = _CATEGORY_CAPS[category]
    selected = [poi for poi, _ in passed[:cap]]
    dropped = len(pois) - len(passed)
    over_cap = max(0, len(passed) - cap)
    logger.info(
        "[%s] quality filter: %d fetched → %d passed quality → %d over cap → %d stored",
        category, len(pois), len(passed), over_cap, len(selected),
    )
    return selected


def _point_id(osm_id: str) -> str:
    """Stable UUID5 derived from the OSM element id (idempotent upserts)."""
    return str(uuid.uuid5(_OSM_NAMESPACE, osm_id))


def _location_phrase(poi: dict[str, Any]) -> str:
    """Human-readable 'in City, Region, Sri Lanka' phrase."""
    where = ", ".join(p for p in (poi.get("city"), poi.get("region")) if p)
    return f"in {where}, Sri Lanka" if where else "in Sri Lanka"


def _hotel_document(poi: dict[str, Any]) -> str:
    """Natural-language description of a hotel for embedding."""
    name = poi.get("name", "This property")
    star = f"{poi['star_rating']}-star " if poi.get("star_rating") else ""
    ptype = poi.get("property_type") or "accommodation"
    sentences = [f"{name} is a {star}{ptype} {_location_phrase(poi)}."]
    if poi.get("description"):
        sentences.append(str(poi["description"]).rstrip(".") + ".")
    if poi.get("price_tier"):
        sentences.append(f"It is a {poi['price_tier']} option for travellers.")
    if poi.get("internet_access") and poi["internet_access"] != "no":
        sentences.append("Internet access is available.")
    if poi.get("address"):
        sentences.append(f"Located at {poi['address']}.")
    return " ".join(sentences)


def _activity_document(poi: dict[str, Any]) -> str:
    """Natural-language description of an attraction/activity for embedding."""
    name = poi.get("name", "This place")
    kind = poi.get("activity_category") or poi.get("subtype") or "attraction"
    sentences = [f"{name} is a {kind} to visit {_location_phrase(poi)}."]
    if poi.get("description"):
        sentences.append(str(poi["description"]).rstrip(".") + ".")
    if poi.get("indoor_outdoor"):
        sentences.append(f"It is an {poi['indoor_outdoor']} activity.")
    if poi.get("fee") == "yes":
        sentences.append("An entry fee applies.")
    elif poi.get("fee") == "no":
        sentences.append("Entry is free.")
    if poi.get("opening_hours"):
        sentences.append(f"Opening hours: {poi['opening_hours']}.")
    return " ".join(sentences)


def _transport_document(poi: dict[str, Any]) -> str:
    """Natural-language description of a transport hub/segment for embedding."""
    name = poi.get("name", "This station")
    mode = poi.get("mode") or poi.get("subtype") or "transport"
    sentences = [f"{name} is a {mode} point {_location_phrase(poi)}."]
    if poi.get("description"):
        sentences.append(str(poi["description"]).rstrip(".") + ".")
    operator = poi.get("operator") or poi.get("network")
    if operator:
        sentences.append(f"Operated by {operator}.")
    return " ".join(sentences)


_DOCUMENT_BUILDERS = {
    "hotels": _hotel_document,
    "activities": _activity_document,
    "transport": _transport_document,
}


def _document(poi: dict[str, Any], category: Category) -> str:
    """Build the retrieval-friendly natural-language text that gets embedded."""
    builder = _DOCUMENT_BUILDERS[category]
    return builder(poi).strip()


def _payload(poi: dict[str, Any], category: Category, content: str) -> dict[str, Any]:
    """Filterable payload + RAG metadata stored alongside the vector.

    ``content`` is the same natural-language text that was embedded, returned at
    retrieval time so the LLM gets meaningful context (not just a name). The rest
    are structured metadata: location, media (image/links), contact, and the
    category-specific attributes that back the collection's payload indexes.
    """
    payload: dict[str, Any] = {
        # The embedded text, surfaced back to the LLM during RAG.
        "content": content,
        # Core identity / classification.
        "name": poi.get("name"),
        "name_en": poi.get("name_en"),
        "category": category,
        "subtype": poi.get("subtype"),
        "description": poi.get("description"),
        # Location metadata (filterable).
        "city": poi.get("city"),
        "region": poi.get("region"),
        "address": poi.get("address"),
        "lat": poi.get("lat"),
        "lon": poi.get("lon"),
        # Media + links for rich UI cards.
        "image_url": poi.get("image_url"),
        "wikipedia_url": poi.get("wikipedia_url"),
        "wikidata": poi.get("wikidata"),
        "website": poi.get("website"),
        # Contact / practical info.
        "phone": poi.get("phone"),
        "opening_hours": poi.get("opening_hours"),
        # Provenance.
        "osm_id": poi.get("osm_id"),
        "source": "openstreetmap",
        "tags": poi.get("tag_keys", []),
    }
    if category == "hotels":
        payload.update(
            {
                "property_type": poi.get("property_type"),
                "star_rating": poi.get("star_rating"),
                "price_tier": poi.get("price_tier"),
                "internet_access": poi.get("internet_access"),
            }
        )
    elif category == "activities":
        payload.update(
            {
                "activity_category": poi.get("activity_category"),
                "indoor_outdoor": poi.get("indoor_outdoor"),
                "fee": poi.get("fee"),
            }
        )
    else:  # transport
        payload.update(
            {
                "mode": poi.get("mode"),
                "network": poi.get("network"),
                "operator": poi.get("operator"),
            }
        )
    # Drop empty values to keep payloads compact.
    return {k: v for k, v in payload.items() if v not in (None, "", [])}


async def _enrich_images(pois: list[dict[str, Any]]) -> int:
    """Fill missing ``image_url`` on POIs from Wikidata/Wikipedia, concurrently.

    Only POIs that lack an OSM image but carry a ``wikidata``/``wikipedia`` tag
    are looked up. Returns how many images were resolved. Best-effort: failures
    leave ``image_url`` as ``None``.
    """
    targets = [
        p
        for p in pois
        if not p.get("image_url") and (p.get("wikidata") or p.get("wikipedia"))
    ]
    if not targets:
        return 0

    semaphore = asyncio.Semaphore(_IMAGE_CONCURRENCY)

    async def _one(poi: dict[str, Any]) -> bool:
        async with semaphore:
            url = await images.resolve_image(
                wikidata=poi.get("wikidata"), wikipedia=poi.get("wikipedia")
            )
        if url:
            poi["image_url"] = url
            return True
        return False

    results = await asyncio.gather(*(_one(p) for p in targets))
    return sum(results)


async def ingest_category(category: Category, *, limit: int = 200) -> dict[str, Any]:
    """Fetch one category from OSM, apply quality rules, and upsert to Qdrant."""
    raw_pois = await osm.fetch_pois(category, limit=limit)
    if not raw_pois:
        return {"category": category, "fetched": 0, "filtered": 0, "upserted": 0, "with_images": 0}

    # --- Rule-based quality filter + capacity cap (no AI involved) ---
    pois = _filter_pois(raw_pois, category)
    if not pois:
        return {"category": category, "fetched": len(raw_pois), "filtered": 0, "upserted": 0, "with_images": 0}

    # Enrich missing images from Wikidata/Wikipedia before embedding/upsert.
    enriched = await _enrich_images(pois)

    embeddings = get_embeddings()
    documents = [_document(p, category) for p in pois]
    vectors = await embeddings.aembed_documents(documents)

    points = [
        qmodels.PointStruct(
            id=_point_id(poi["osm_id"]),
            vector=vector,
            payload=_payload(poi, category, content),
        )
        for poi, vector, content in zip(pois, vectors, documents)
    ]

    collection = collection_name(_CATEGORY_TO_COLLECTION[category])
    await get_qdrant().upsert(collection_name=collection, points=points)
    with_images = sum(1 for p in pois if p.get("image_url"))
    logger.info(
        "Ingested %d %s POIs into '%s' (%d with images, %d newly enriched)",
        len(points),
        category,
        collection,
        with_images,
        enriched,
    )
    return {
        "category": category,
        "fetched": len(raw_pois),
        "filtered": len(pois),
        "upserted": len(points),
        "with_images": with_images,
    }


async def ingest_all(*, limit: int = 200) -> dict[str, Any]:
    """Ingest hotels, activities and transport for Sri Lanka."""
    results = {}
    for category in ("hotels", "activities", "transport"):
        results[category] = await ingest_category(category, limit=limit)  # type: ignore[arg-type]
    return {"results": results}
