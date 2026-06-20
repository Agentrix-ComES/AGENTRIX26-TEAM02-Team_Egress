"""Real-time news and travel-alert provider for Sri Lanka (MVP free tier).

Three keyless / free-key sources are combined so the Disruption Agent and the
Alerts Worker have live context about events that could affect a trip:

1. **The Guardian Open Platform** (free developer key, ~12 req/s)
   - Real news mentioning "Sri Lanka": road closures, protests, weather events.
   - Register once at https://open-platform.theguardian.com/access/
   - Set ``GUARDIAN_API_KEY`` in .env. Works without a key at lower rate limit.

2. **GDACS RSS** (no key, no rate limit)
   - Global Disaster Alert and Coordination System.
   - Covers floods, storms, earthquakes affecting Sri Lanka.
   - https://www.gdacs.org/xml/rss.xml

3. **US State Department Travel Advisories** (no key, no rate limit)
   - Official travel advisory level (1-4) and notes for Sri Lanka.
   - https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/sri-lanka-travel-advisory.html
   - JSON endpoint: https://travel.state.gov/content/dam/NEWTravelAssets/pdfs/LK.json

All three are cached in Redis. Failures degrade gracefully — if one source is
down the others still provide alerts.
"""
from __future__ import annotations

import logging
import xml.etree.ElementTree as ET
from typing import Any

from app.core.config import settings
from app.providers.base import fetch_json, fetch_text

logger = logging.getLogger(__name__)

# ── The Guardian ─────────────────────────────────────────────────────────────
_GUARDIAN_URL = "https://content.guardianapis.com/search"
# Requires "Sri Lanka" AND at least one disruption/travel term.
# This prevents sports/cricket articles that only mention Sri Lanka from appearing.
_GUARDIAN_QUERY = '"Sri Lanka" AND (flood OR storm OR protest OR closure OR strike OR earthquake OR emergency OR warning OR travel advisory OR road block OR curfew OR tsunami OR landslide OR unrest)'


async def fetch_guardian_news(*, max_results: int = 10) -> list[dict[str, Any]]:
    """Fetch recent Guardian articles mentioning Sri Lanka travel disruptions.

    Works without an API key (anonymous access) but is rate-limited to ~1 req/s.
    Set GUARDIAN_API_KEY for the free-tier 12 req/s limit.
    """
    params: dict[str, Any] = {
        "q": _GUARDIAN_QUERY,
        "order-by": "newest",
        "page-size": min(max_results * 3, 30),  # fetch extra to post-filter
        "show-fields": "headline,trailText,webUrl,webPublicationDate",
        "format": "json",
    }
    if settings.guardian_api_key:
        params["api-key"] = settings.guardian_api_key
    else:
        params["api-key"] = "test"  # Guardian's public test key

    try:
        data = await fetch_json(
            "GET",
            _GUARDIAN_URL,
            params=params,
            cache_namespace="guardian:news",
            cache_ttl=settings.cache_ttl_news_alerts,
            cache_payload={"q": _GUARDIAN_QUERY, "n": max_results},
        )
        results = (data or {}).get("response", {}).get("results") or []
        # Post-filter: ensure 'sri lanka' appears in the headline or trail
        _sl = "sri lanka"
        sl_results = [
            r for r in results
            if _sl in (r.get("fields", {}).get("headline") or r.get("webTitle", "")).lower()
            or _sl in (r.get("fields", {}).get("trailText") or "").lower()
        ]
        return [
            {
                "source": "guardian",
                "title": r.get("fields", {}).get("headline") or r.get("webTitle"),
                "summary": r.get("fields", {}).get("trailText"),
                "url": r.get("webUrl"),
                "published_at": r.get("webPublicationDate"),
                "severity": _infer_severity(
                    (r.get("fields", {}).get("headline") or "") + " " +
                    (r.get("fields", {}).get("trailText") or "")
                ),
            }
            for r in sl_results[:max_results]
        ]
    except Exception as exc:
        logger.warning("Guardian fetch failed: %s", exc)
        return []


# ── GDACS RSS ─────────────────────────────────────────────────────────────────
_GDACS_RSS_URL = "https://www.gdacs.org/xml/rss.xml"
_SL_KEYWORDS = ("sri lanka", "colombo", "kandy", "galle", "trincomalee", "lk")


async def fetch_gdacs_alerts() -> list[dict[str, Any]]:
    """Parse GDACS RSS for disaster alerts affecting Sri Lanka.

    GDACS is keyless and covers floods, storms, earthquakes, and cyclones.
    """
    try:
        xml_text = await fetch_text(
            "GET",
            _GDACS_RSS_URL,
            cache_namespace="gdacs:rss",
            cache_ttl=settings.cache_ttl_news_alerts,
            cache_payload={"src": "gdacs"},
        )
        root = ET.fromstring(xml_text)
        channel = root.find("channel")
        if channel is None:
            return []
        items = []
        for item in channel.findall("item"):
            title = (item.findtext("title") or "").lower()
            desc = (item.findtext("description") or "").lower()
            if not any(kw in title or kw in desc for kw in _SL_KEYWORDS):
                continue
            items.append({
                "source": "gdacs",
                "title": item.findtext("title"),
                "summary": item.findtext("description"),
                "url": item.findtext("link"),
                "published_at": item.findtext("pubDate"),
                "severity": _infer_severity(title + " " + desc),
            })
        return items
    except Exception as exc:
        logger.warning("GDACS fetch failed: %s", exc)
        return []


# ── US State Department Travel Advisories ────────────────────────────────────
# The old LK.json endpoint no longer exists; scrape the HTML advisory page.
_STATE_DEPT_HTML_URL = "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/sri-lanka-travel-advisory.html"
_ADVISORY_LEVELS = {1: "low", 2: "moderate", 3: "high", 4: "critical"}

import re as _re


async def fetch_state_dept_advisory() -> dict[str, Any] | None:
    """Fetch the US State Dept advisory level and notes for Sri Lanka.

    Scrapes the HTML page to extract the advisory level (1-4).
    Returns a compact summary; null if the endpoint is unreachable.
    """
    try:
        html = await fetch_text(
            "GET",
            _STATE_DEPT_HTML_URL,
            cache_namespace="statedept:advisory",
            cache_ttl=settings.cache_ttl_travel_advisory,
            cache_payload={"country": "LK"},
        )
        level = None
        label = "unknown"
        # Match "Level 1", "Level 2", etc. in the page
        level_match = _re.search(r'Level\s+([1-4])', html, _re.IGNORECASE)
        if level_match:
            level = int(level_match.group(1))
            label = _ADVISORY_LEVELS.get(level, "unknown")
        title_match = _re.search(r'<title>([^<]{10,})</title>', html, _re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else "Sri Lanka Travel Advisory"
        return {
            "source": "us_state_dept",
            "country": "Sri Lanka",
            "advisory_level": level,
            "advisory_label": label,
            "title": title,
            "summary": f"US State Dept advisory level {level} ({label}) for Sri Lanka." if level else "Advisory details unavailable.",
            "url": _STATE_DEPT_HTML_URL,
            "last_updated": None,
        }
    except Exception as exc:
        logger.warning("State Dept advisory fetch failed: %s", exc)
        return None


# ── Daily Mirror LK RSS (local news fallback) ─────────────────────────────────
_DAILY_MIRROR_RSS = "https://www.dailymirror.lk/rss.xml"


async def fetch_daily_mirror_news(*, max_results: int = 8) -> list[dict[str, Any]]:
    """Fallback: local Sri Lanka news from Daily Mirror RSS (no key required)."""
    try:
        xml_text = await fetch_text(
            "GET",
            _DAILY_MIRROR_RSS,
            cache_namespace="dailymirror:rss",
            cache_ttl=settings.cache_ttl_news_alerts,
            cache_payload={"src": "dailymirror"},
        )
        root = ET.fromstring(xml_text)
        channel = root.find("channel")
        if channel is None:
            return []
        items = []
        for item in list(channel.findall("item"))[:max_results]:
            title = item.findtext("title") or ""
            desc = item.findtext("description") or ""
            items.append({
                "source": "daily_mirror_lk",
                "title": title,
                "summary": desc[:300] if desc else None,
                "url": item.findtext("link"),
                "published_at": item.findtext("pubDate"),
                "severity": _infer_severity(title.lower() + " " + desc.lower()),
            })
        return items
    except Exception as exc:
        logger.warning("Daily Mirror RSS fetch failed: %s", exc)
        return []


# ── Severity inference ────────────────────────────────────────────────────────
_HIGH_KEYWORDS = frozenset({
    "flood", "cyclone", "storm", "earthquake", "tsunami", "evacuate",
    "emergency", "closure", "curfew", "protest", "unrest", "strike",
    "cancel", "suspend", "dangerous",
})
_MEDIUM_KEYWORDS = frozenset({
    "rain", "delay", "disruption", "warning", "alert", "traffic",
    "road block", "road closure", "demonstration",
})


def _infer_severity(text: str) -> str:
    """Heuristic severity label from alert/article text."""
    t = text.lower()
    if any(kw in t for kw in _HIGH_KEYWORDS):
        return "high"
    if any(kw in t for kw in _MEDIUM_KEYWORDS):
        return "medium"
    return "low"
