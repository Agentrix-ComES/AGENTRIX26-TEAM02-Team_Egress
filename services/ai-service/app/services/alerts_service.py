"""Alerts domain service: aggregate real-time Sri Lanka news and travel advisories.

Combines three free sources (The Guardian, GDACS, US State Dept) plus a local
RSS fallback (Daily Mirror LK) into a single ranked alert feed. Results are
de-duplicated by URL and sorted: high-severity first, then by publish date.

The Disruption Agent consumes this service to detect proactive trip impacts.
"""
from __future__ import annotations

import logging
from typing import Any

from app.providers import news_alerts as provider

logger = logging.getLogger(__name__)


def _deduplicate(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Remove duplicate alerts by URL (keep first occurrence)."""
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for item in items:
        url = item.get("url") or ""
        if url and url in seen:
            continue
        seen.add(url)
        out.append(item)
    return out


_SEVERITY_ORDER = {"high": 0, "medium": 1, "low": 2}


def _sort_alerts(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Sort alerts: high severity first, then most recently published."""
    return sorted(
        items,
        key=lambda a: (
            _SEVERITY_ORDER.get(a.get("severity", "low"), 2),
            # Reverse published_at so newer items come first within same severity.
            -(hash(a.get("published_at") or "") & 0xFFFFFFFF),
        ),
    )


async def get_alerts(
    *,
    include_news: bool = True,
    include_gdacs: bool = True,
    include_advisory: bool = True,
    include_local: bool = True,
    max_news: int = 10,
) -> dict[str, Any]:
    """Fetch and merge all alert sources into one ranked feed.

    Args:
        include_news: Fetch from The Guardian.
        include_gdacs: Fetch GDACS disaster RSS.
        include_advisory: Fetch US State Dept advisory.
        include_local: Fetch Daily Mirror LK RSS as fallback.
        max_news: Max articles from The Guardian.

    Returns:
        {
          "advisory": {...} | null,   # US State Dept level + summary
          "alerts": [...],            # merged & ranked news/disaster items
          "sources_used": [...],      # which sources responded
          "total": int,
        }
    """
    advisory: dict[str, Any] | None = None
    alert_items: list[dict[str, Any]] = []
    sources_used: list[str] = []

    # Fetch all sources concurrently.
    import asyncio
    tasks = {}
    if include_advisory:
        tasks["advisory"] = provider.fetch_state_dept_advisory()
    if include_gdacs:
        tasks["gdacs"] = provider.fetch_gdacs_alerts()
    if include_news:
        tasks["guardian"] = provider.fetch_guardian_news(max_results=max_news)
    if include_local:
        tasks["local"] = provider.fetch_daily_mirror_news()

    results = await asyncio.gather(*tasks.values(), return_exceptions=True)
    result_map = dict(zip(tasks.keys(), results))

    if "advisory" in result_map:
        val = result_map["advisory"]
        if not isinstance(val, Exception) and val:
            advisory = val
            sources_used.append("us_state_dept")

    for key in ("gdacs", "guardian", "local"):
        if key not in result_map:
            continue
        val = result_map[key]
        if isinstance(val, Exception):
            logger.warning("Alert source %s failed: %s", key, val)
            continue
        if val:
            alert_items.extend(val)
            sources_used.append(key)

    alert_items = _deduplicate(alert_items)
    alert_items = _sort_alerts(alert_items)

    return {
        "advisory": advisory,
        "alerts": alert_items,
        "sources_used": sources_used,
        "total": len(alert_items),
    }
