"""Data routes: real-time weather, content ingestion, and POI browsing."""
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Query

from app.core.config import settings
from app.db.qdrant import get_qdrant
from app.db.qdrant_collections import collection_name
from app.graph.tools.qdrant_search import build_filter, search_collection
from app.services import content_ingest_service, weather_service

router = APIRouter(prefix="/data", tags=["data"])

# Categories that have their own Qdrant collection.
_BROWSABLE: dict[str, str] = {
    "hotels": "hotels",
    "activities": "activities",
    "transport": "transport",
}


@router.get(
    "/weather",
    summary="Real-time weather outlook for a place",
    response_description="Current conditions, daily outlook, and risk flags.",
)
async def weather(
    place: str = Query(..., description="Place name, e.g. 'Kandy' (Sri Lanka)"),
    days: int = Query(5, ge=1, le=16, description="Forecast days"),
) -> dict[str, Any]:
    """Geocode a place (Open-Meteo) and return its weather summary."""
    summary = await weather_service.get_weather_for_place(place, days=days)
    if summary is None:
        raise HTTPException(status_code=404, detail=f"Could not locate place: {place!r}")
    return summary


@router.post(
    "/ingest",
    summary="Ingest Sri Lanka POIs from OpenStreetMap into Qdrant",
    response_description="Counts of fetched, quality-filtered, and upserted items per category.",
)
async def ingest(
    category: Literal["hotels", "activities", "transport", "all"] = Query(
        "all", description="Which content category to ingest"
    ),
    limit: int = Query(200, ge=1, le=2000, description="Max POIs to fetch per category"),
) -> dict[str, Any]:
    """Pull POIs from OSM Overpass, apply quality rules + capacity cap, and upsert to Qdrant."""
    if category == "all":
        return await content_ingest_service.ingest_all(limit=limit)
    return await content_ingest_service.ingest_category(category, limit=limit)  # type: ignore[arg-type]


@router.get(
    "/places",
    summary="Browse stored POIs by category with optional filters",
    response_description="Paginated list of POIs with payload metadata.",
)
async def browse_places(
    category: Literal["hotels", "activities", "transport"] = Query(
        ..., description="Category to browse"
    ),
    city: str | None = Query(None, description="Filter by city name (exact match)"),
    region: str | None = Query(None, description="Filter by region / province"),
    subtype: str | None = Query(
        None, description="Filter by subtype, e.g. 'hotel', 'museum', 'station'"
    ),
    has_image: bool | None = Query(None, description="Only return POIs that have an image URL"),
    limit: int = Query(20, ge=1, le=100, description="Max results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip (pagination)"),
) -> dict[str, Any]:
    """Scroll the Qdrant collection for a category and apply payload filters.

    No embedding is performed — this is a pure metadata filter + scroll, so it
    returns results instantly regardless of query text.
    """
    col = collection_name(_BROWSABLE[category])
    client = get_qdrant()

    # Build filter conditions from query params.
    filter_dict: dict[str, Any] = {"category": category}
    if city:
        filter_dict["city"] = city
    if region:
        filter_dict["region"] = region
    if subtype:
        filter_dict["subtype"] = subtype

    qdrant_filter = build_filter(filter_dict) if len(filter_dict) > 1 else build_filter({"category": category})

    # Scroll the collection (no vector needed).
    result = await client.scroll(
        collection_name=col,
        scroll_filter=qdrant_filter,
        limit=limit,
        offset=offset,
        with_payload=True,
        with_vectors=False,
    )
    points, next_offset = result

    items = []
    for pt in points:
        p = pt.payload or {}
        # Apply has_image filter post-scroll (Qdrant doesn't have a "key exists" filter in all versions)
        if has_image is True and not p.get("image_url"):
            continue
        if has_image is False and p.get("image_url"):
            continue
        items.append({
            "id": str(pt.id),
            "name": p.get("name"),
            "category": p.get("category"),
            "subtype": p.get("subtype"),
            "city": p.get("city"),
            "region": p.get("region"),
            "address": p.get("address"),
            "lat": p.get("lat"),
            "lon": p.get("lon"),
            "image_url": p.get("image_url"),
            "website": p.get("website"),
            "opening_hours": p.get("opening_hours"),
            "description": p.get("description"),
            # Category-specific fields
            "property_type": p.get("property_type"),
            "star_rating": p.get("star_rating"),
            "price_tier": p.get("price_tier"),
            "activity_category": p.get("activity_category"),
            "indoor_outdoor": p.get("indoor_outdoor"),
            "fee": p.get("fee"),
            "mode": p.get("mode"),
            "operator": p.get("operator"),
        })

    # Fetch total count for this category to return pagination info.
    info = await client.get_collection(col)
    total = info.points_count or 0

    return {
        "category": category,
        "total_in_collection": total,
        "returned": len(items),
        "offset": offset,
        "next_offset": str(next_offset) if next_offset else None,
        "filters_applied": {k: v for k, v in {
            "city": city, "region": region, "subtype": subtype, "has_image": has_image,
        }.items() if v is not None},
        "items": items,
    }


@router.get(
    "/places/search",
    summary="Semantic search across POIs with optional category filter",
    response_description="Ranked list of matching POIs with relevance scores.",
)
async def search_places(
    q: str = Query(..., min_length=2, description="Search query, e.g. 'beach near Galle'"),
    category: Literal["hotels", "activities", "transport"] | None = Query(
        None, description="Restrict search to one category (omit for all)"
    ),
    city: str | None = Query(None, description="Filter by city"),
    limit: int = Query(10, ge=1, le=50, description="Max results to return"),
) -> dict[str, Any]:
    """Embed the query with Gemini and search the matching Qdrant collection(s).

    Applies MMR re-ranking for relevance + diversity. Results include a
    ``score`` (0–1 cosine similarity) and the full POI payload.
    """
    filters: dict[str, Any] = {}
    if city:
        filters["city"] = city

    categories = [category] if category else list(_BROWSABLE.keys())
    all_hits: list[dict[str, Any]] = []

    for cat in categories:
        hits = await search_collection(
            _BROWSABLE[cat],
            q,
            limit=limit,
            filters=filters if filters else None,
            score_threshold=settings.qdrant_score_threshold or None,
        )
        for h in hits:
            p = h.get("payload", {})
            all_hits.append({
                "score": round(h["score"], 4),
                "id": h["id"],
                "category": p.get("category") or cat,
                "name": p.get("name"),
                "subtype": p.get("subtype"),
                "city": p.get("city"),
                "region": p.get("region"),
                "address": p.get("address"),
                "lat": p.get("lat"),
                "lon": p.get("lon"),
                "image_url": p.get("image_url"),
                "website": p.get("website"),
                "description": p.get("description"),
                "property_type": p.get("property_type"),
                "star_rating": p.get("star_rating"),
                "price_tier": p.get("price_tier"),
                "activity_category": p.get("activity_category"),
                "indoor_outdoor": p.get("indoor_outdoor"),
                "fee": p.get("fee"),
                "mode": p.get("mode"),
                "content": p.get("content"),
            })

    # Sort by score across all categories and trim to limit.
    all_hits.sort(key=lambda h: h["score"], reverse=True)
    all_hits = all_hits[:limit]

    return {
        "query": q,
        "categories_searched": categories,
        "filters_applied": {k: v for k, v in {"city": city}.items() if v is not None},
        "total": len(all_hits),
        "results": all_hits,
    }
