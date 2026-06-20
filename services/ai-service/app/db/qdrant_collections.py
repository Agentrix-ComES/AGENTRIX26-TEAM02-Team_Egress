"""Qdrant collection registry for the travel RAG knowledge base.

Each content domain (hotels, activities, transport, ...) lives in its own
collection so it can be embedded, filtered, scaled and re-indexed independently.
A node retrieving "places to stay" never has to wade through transport content,
and per-collection payload indexes let us filter by city, price tier, season,
dietary needs, etc. before semantic ranking — the core of the advanced RAG flow.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.core.config import settings


# --- Logical collection keys (stable identifiers used across the codebase) ----
HOTELS = "hotels"
ACTIVITIES = "activities"
TRANSPORT = "transport"
DINING = "dining"
CULTURE = "culture"
EVENTS = "events"
DESTINATIONS = "destinations"


@dataclass(frozen=True)
class CollectionSpec:
    """Declarative definition of one Qdrant collection."""

    key: str
    description: str
    # Payload fields to expose as filterable keyword indexes (exact match / `in`).
    keyword_indexes: tuple[str, ...] = ()
    # Payload fields indexed as integers for range filters (e.g. price, rating).
    integer_indexes: tuple[str, ...] = ()
    # Payload fields indexed as floats for range filters (e.g. lat/lon, score).
    float_indexes: tuple[str, ...] = ()

    @property
    def name(self) -> str:
        """Physical collection name including the optional env prefix."""
        prefix = settings.qdrant_collection_prefix
        return f"{prefix}{self.key}" if prefix else self.key


# --- The knowledge base layout -----------------------------------------------
COLLECTION_SPECS: tuple[CollectionSpec, ...] = (
    CollectionSpec(
        key=HOTELS,
        description="Accommodation: hotels, guesthouses, villas, homestays.",
        keyword_indexes=("city", "region", "price_tier", "property_type", "tags"),
        integer_indexes=("star_rating",),
        float_indexes=("lat", "lon", "rating"),
    ),
    CollectionSpec(
        key=ACTIVITIES,
        description="Things to do: attractions, sites, hikes, wildlife, tours.",
        keyword_indexes=("city", "region", "category", "season", "indoor_outdoor", "tags"),
        integer_indexes=("duration_minutes",),
        float_indexes=("lat", "lon", "rating"),
    ),
    CollectionSpec(
        key=TRANSPORT,
        description="Transport options & segments: train, bus, tuk-tuk, taxi, ferry.",
        keyword_indexes=("mode", "origin", "destination", "region", "tags"),
        integer_indexes=("duration_minutes",),
        float_indexes=("distance_km",),
    ),
    CollectionSpec(
        key=DINING,
        description="Food & dining: restaurants, cafes, street food, local cuisine.",
        keyword_indexes=("city", "region", "cuisine", "price_tier", "dietary", "tags"),
        float_indexes=("lat", "lon", "rating"),
    ),
    CollectionSpec(
        key=CULTURE,
        description="Cultural & etiquette knowledge: temple rules, dress codes, customs.",
        keyword_indexes=("region", "site_type", "religion", "tags"),
    ),
    CollectionSpec(
        key=EVENTS,
        description="Festivals & events with seasonal/date impact on travel.",
        keyword_indexes=("city", "region", "event_type", "month", "tags"),
    ),
    CollectionSpec(
        key=DESTINATIONS,
        description="Region/place overviews used for high-level grounding.",
        keyword_indexes=("region", "best_season", "tags"),
        float_indexes=("lat", "lon"),
    ),
)

# Fast lookup by logical key.
SPEC_BY_KEY: dict[str, CollectionSpec] = {spec.key: spec for spec in COLLECTION_SPECS}


def spec(key: str) -> CollectionSpec:
    """Return the collection spec for a logical key (raises if unknown)."""
    try:
        return SPEC_BY_KEY[key]
    except KeyError as exc:  # pragma: no cover - defensive
        raise ValueError(f"Unknown Qdrant collection key: {key!r}") from exc


def collection_name(key: str) -> str:
    """Resolve a logical key to its physical, prefix-aware collection name."""
    return spec(key).name
