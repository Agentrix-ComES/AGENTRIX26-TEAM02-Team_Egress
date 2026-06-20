"""Wikimedia image provider: resolve real photos for POIs.

OSM only tags a minority of places with a direct ``image``. Far more carry a
``wikidata`` (e.g. ``Q43332``) or ``wikipedia`` (e.g. ``en:Sigiriya``) tag, both
of which resolve to a hosted photograph:

- Wikipedia REST ``page/summary`` returns a ``thumbnail`` for the article.
- Wikidata entity ``P18`` is a Commons filename → served via ``Special:FilePath``.

Results are cached (long TTL) since images rarely change.
"""
from __future__ import annotations

import logging
from typing import Any

from app.core.config import settings
from app.providers.base import fetch_json

logger = logging.getLogger(__name__)

_WIKIDATA_ENTITY = "https://www.wikidata.org/wiki/Special:EntityData/{qid}.json"


def _commons_filepath(filename: str, *, width: int = 800) -> str:
    """Build a Wikimedia Commons direct image URL from a file name."""
    return (
        "https://commons.wikimedia.org/wiki/Special:FilePath/"
        f"{filename.replace(' ', '_')}?width={width}"
    )


async def image_for_wikipedia(wikipedia_tag: str) -> str | None:
    """Resolve an OSM ``wikipedia`` tag (``lang:Title``) to a thumbnail URL."""
    if not wikipedia_tag or ":" not in wikipedia_tag:
        return None
    lang, title = wikipedia_tag.split(":", 1)
    url = (
        f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/"
        f"{title.replace(' ', '_')}"
    )
    try:
        data = await fetch_json(
            "GET",
            url,
            cache_namespace="wikipedia:summary",
            cache_ttl=settings.cache_ttl_places,
            cache_payload={"wp": wikipedia_tag.lower()},
        )
    except Exception as exc:  # noqa: BLE001 - enrichment is best-effort
        logger.debug("Wikipedia summary failed for %s: %s", wikipedia_tag, exc)
        return None
    thumb = (data or {}).get("thumbnail") or {}
    original = (data or {}).get("originalimage") or {}
    return original.get("source") or thumb.get("source")


async def image_for_wikidata(qid: str) -> str | None:
    """Resolve a Wikidata id (``Q123``) to its ``P18`` image URL, if any."""
    if not qid or not qid.upper().startswith("Q"):
        return None
    qid = qid.upper()
    try:
        data = await fetch_json(
            "GET",
            _WIKIDATA_ENTITY.format(qid=qid),
            cache_namespace="wikidata:entity",
            cache_ttl=settings.cache_ttl_places,
            cache_payload={"qid": qid},
        )
    except Exception as exc:  # noqa: BLE001 - enrichment is best-effort
        logger.debug("Wikidata lookup failed for %s: %s", qid, exc)
        return None
    entity = ((data or {}).get("entities") or {}).get(qid) or {}
    claims = (entity.get("claims") or {}).get("P18") or []
    if not claims:
        return None
    try:
        filename = claims[0]["mainsnak"]["datavalue"]["value"]
    except (KeyError, IndexError, TypeError):
        return None
    return _commons_filepath(filename)


async def resolve_image(
    *,
    wikidata: str | None = None,
    wikipedia: str | None = None,
) -> str | None:
    """Best-effort image lookup, preferring Wikidata's curated photo."""
    if wikidata:
        url = await image_for_wikidata(wikidata)
        if url:
            return url
    if wikipedia:
        return await image_for_wikipedia(wikipedia)
    return None
