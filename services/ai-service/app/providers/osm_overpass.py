"""OpenStreetMap Overpass provider: keyless POIs for Sri Lanka.

Overpass needs no API key and OSM data (ODbL) may be cached/stored with
attribution, which makes it the practical free source for seeding the
``hotels``, ``activities`` and ``transport`` Qdrant collections with real
Sri Lanka content. Queries are scoped to the configured SL bounding box.
"""
from __future__ import annotations

from typing import Any, Literal

from app.core.config import settings
from app.providers.base import fetch_json

Category = Literal["hotels", "activities", "transport"]

# Overpass tag filters per content category. Each entry produces node/way/relation
# selectors over the Sri Lanka bounding box.
_TAG_FILTERS: dict[Category, list[str]] = {
    "hotels": [
        'tourism=hotel',
        'tourism=guest_house',
        'tourism=hostel',
        'tourism=motel',
        'tourism=apartment',
        'tourism=chalet',
    ],
    "activities": [
        'tourism=attraction',
        'tourism=museum',
        'tourism=viewpoint',
        'tourism=theme_park',
        'tourism=zoo',
        'historic=monument',
        'historic=ruins',
        'historic=archaeological_site',
        'natural=beach',
        'natural=waterfall',
        'leisure=park',
        'leisure=nature_reserve',
        'boundary=national_park',
    ],
    "transport": [
        'railway=station',
        'railway=halt',
        'amenity=bus_station',
        'highway=bus_stop',
        'aeroway=aerodrome',
        'amenity=ferry_terminal',
    ],
}


def _bbox() -> str:
    """Sri Lanka bounding box as Overpass ``(south,west,north,east)``."""
    s = settings
    return f"{s.sl_bbox_south},{s.sl_bbox_west},{s.sl_bbox_north},{s.sl_bbox_east}"


def _build_query(category: Category, limit: int) -> str:
    """Assemble an Overpass QL query for a category over the SL bbox."""
    bbox = _bbox()
    parts: list[str] = []
    for tag in _TAG_FILTERS[category]:
        key, value = tag.split("=", 1)
        for element in ("node", "way", "relation"):
            parts.append(f'{element}["{key}"="{value}"]({bbox});')
    body = "\n  ".join(parts)
    return f"[out:json][timeout:90];\n(\n  {body}\n);\nout center {limit};"


def _image_url(tags: dict[str, Any]) -> str | None:
    """Derive a usable image URL from common OSM image tags.

    OSM stores images as a direct ``image`` URL or a ``wikimedia_commons`` file
    reference (``File:Foo.jpg``). The latter is resolved through the Wikimedia
    Commons ``Special:FilePath`` redirect, which serves the actual image.
    """
    direct = tags.get("image")
    if direct and direct.startswith("http"):
        return direct
    commons = tags.get("wikimedia_commons")
    if commons and commons.startswith("File:"):
        filename = commons.split("File:", 1)[1].replace(" ", "_")
        return f"https://commons.wikimedia.org/wiki/Special:FilePath/{filename}?width=800"
    return None


def _wikipedia_url(tags: dict[str, Any]) -> str | None:
    """Build a Wikipedia article URL from a ``wikipedia`` tag (``en:Title``)."""
    wp = tags.get("wikipedia")
    if not wp or ":" not in wp:
        return None
    lang, title = wp.split(":", 1)
    return f"https://{lang}.wikipedia.org/wiki/{title.replace(' ', '_')}"


def _price_tier(tags: dict[str, Any]) -> str | None:
    """Infer a coarse price tier from OSM stars / fee tags."""
    stars = tags.get("stars")
    if stars and stars[0].isdigit():
        n = int(stars[0])
        if n >= 5:
            return "luxury"
        if n == 4:
            return "upscale"
        if n == 3:
            return "midrange"
        return "budget"
    return None


def _full_address(tags: dict[str, Any]) -> str | None:
    """Assemble a human-readable address from OSM addr:* tags."""
    parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:city"),
        tags.get("addr:postcode"),
    ]
    joined = " ".join(p for p in parts if p)
    return joined or None


def _category_details(tags: dict[str, Any], category: Category) -> dict[str, Any]:
    """Extract fields specific to hotels / activities / transport."""
    if category == "hotels":
        stars = tags.get("stars")
        return {
            "property_type": tags.get("tourism"),
            "star_rating": int(stars[0]) if stars and stars[0].isdigit() else None,
            "price_tier": _price_tier(tags),
            "rooms": tags.get("rooms"),
            "internet_access": tags.get("internet_access"),
        }
    if category == "activities":
        outdoor_subtypes = {"beach", "waterfall", "park", "viewpoint", "nature_reserve"}
        subtype = tags.get("natural") or tags.get("leisure") or tags.get("tourism")
        return {
            "activity_category": tags.get("tourism") or tags.get("historic")
            or tags.get("natural") or tags.get("leisure"),
            "indoor_outdoor": "outdoor" if subtype in outdoor_subtypes else "indoor",
            "fee": tags.get("fee"),
            "opening_hours": tags.get("opening_hours"),
        }
    # transport
    mode_map = {
        "station": "train",
        "halt": "train",
        "bus_station": "bus",
        "bus_stop": "bus",
        "aerodrome": "flight",
        "ferry_terminal": "ferry",
    }
    raw = tags.get("railway") or tags.get("amenity") or tags.get("highway") or tags.get("aeroway")
    return {
        "mode": mode_map.get(raw, raw),
        "network": tags.get("network"),
        "operator": tags.get("operator"),
    }


def _normalize(element: dict[str, Any], category: Category) -> dict[str, Any] | None:
    """Flatten an Overpass element into a clean POI record with coordinates."""
    tags = element.get("tags") or {}
    name = tags.get("name") or tags.get("name:en")
    if not name:
        return None
    # Nodes carry lat/lon directly; ways/relations carry a computed `center`.
    lat = element.get("lat") or (element.get("center") or {}).get("lat")
    lon = element.get("lon") or (element.get("center") or {}).get("lon")
    if lat is None or lon is None:
        return None
    record = {
        "osm_id": f"{element.get('type')}/{element.get('id')}",
        "name": name,
        "name_en": tags.get("name:en"),
        "category": category,
        "lat": float(lat),
        "lon": float(lon),
        "city": tags.get("addr:city"),
        "region": tags.get("addr:state") or tags.get("addr:province"),
        "address": _full_address(tags),
        "subtype": tags.get("tourism") or tags.get("historic") or tags.get("natural")
        or tags.get("leisure") or tags.get("railway") or tags.get("amenity"),
        "description": tags.get("description"),
        "website": tags.get("website") or tags.get("contact:website"),
        "phone": tags.get("phone") or tags.get("contact:phone"),
        "image_url": _image_url(tags),
        "wikipedia_url": _wikipedia_url(tags),
        "wikipedia": tags.get("wikipedia"),
        "wikidata": tags.get("wikidata"),
        "opening_hours": tags.get("opening_hours"),
        "tag_keys": list(tags.keys())[:25],
    }
    record.update(_category_details(tags, category))
    return record


async def fetch_pois(category: Category, *, limit: int = 200) -> list[dict[str, Any]]:
    """Fetch and normalize POIs of a category across Sri Lanka."""
    query = _build_query(category, limit)
    data = await fetch_json(
        "POST",
        settings.overpass_url,
        data={"data": query},
        cache_namespace="overpass",
        cache_ttl=settings.cache_ttl_places,
        cache_payload={"category": category, "limit": limit, "bbox": _bbox()},
    )
    elements = (data or {}).get("elements") or []
    pois = (_normalize(el, category) for el in elements)
    return [p for p in pois if p is not None]
