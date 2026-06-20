"""Async Redis cache client and JSON cache helpers.

Used by provider clients to cache external API responses with per-data-type TTLs
(weather is volatile → short TTL; geocoding/places → long TTL). Caching is
best-effort: if Redis is unavailable the callers still hit the upstream API.
"""
from __future__ import annotations

import json
import logging
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    """Return a singleton async Redis client."""
    global _client
    if _client is None:
        _client = aioredis.from_url(
            settings.redis_dsn,
            encoding="utf-8",
            decode_responses=True,
        )
    return _client


async def cache_get_json(key: str) -> Any | None:
    """Read and JSON-decode a cached value, or ``None`` on miss/error."""
    try:
        raw = await get_redis().get(key)
    except Exception as exc:  # noqa: BLE001 - cache is best-effort
        logger.warning("Redis GET failed for %s: %s", key, exc)
        return None
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except (TypeError, ValueError):
        return None


async def cache_set_json(key: str, value: Any, ttl: int) -> None:
    """JSON-encode and store a value with a TTL (seconds). Best-effort."""
    try:
        await get_redis().set(key, json.dumps(value, ensure_ascii=False), ex=ttl)
    except Exception as exc:  # noqa: BLE001 - cache is best-effort
        logger.warning("Redis SET failed for %s: %s", key, exc)


async def verify_redis() -> None:
    """Ping Redis on startup; log a warning instead of failing the service."""
    try:
        await get_redis().ping()
        logger.info("Redis connection OK")
    except Exception as exc:  # noqa: BLE001 - degrade gracefully
        logger.warning("Redis unavailable, caching disabled: %s", exc)


async def close_redis() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
