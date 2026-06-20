"""Shared HTTP plumbing for external data providers.

Every provider client goes through here so retries, timeouts, a shared async
``httpx`` client, and a consistent cache-key scheme are defined in one place.
Agents never import this directly — only domain services / provider clients do,
preserving the strict layering (agents → services → providers → external APIs).
"""
from __future__ import annotations

import hashlib
import json
import logging
from typing import Any

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import settings
from app.db.redis import cache_get_json, cache_set_json

logger = logging.getLogger(__name__)

_client: httpx.AsyncClient | None = None

# Transient errors worth retrying.
_RETRYABLE = (httpx.TransportError, httpx.HTTPStatusError)


def get_http_client() -> httpx.AsyncClient:
    """Return a singleton shared async HTTP client."""
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            timeout=settings.http_timeout_seconds,
            headers={"User-Agent": settings.http_user_agent},
            follow_redirects=True,
        )
    return _client


async def close_http_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


def cache_key(namespace: str, payload: Any) -> str:
    """Build a deterministic cache key from a namespace + arbitrary payload."""
    blob = json.dumps(payload, sort_keys=True, ensure_ascii=False, default=str)
    digest = hashlib.sha1(blob.encode("utf-8")).hexdigest()[:16]
    return f"provider:{namespace}:{digest}"


@retry(
    reraise=True,
    stop=stop_after_attempt(settings.http_max_retries),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=8),
    retry=retry_if_exception_type(_RETRYABLE),
)
async def _request(method: str, url: str, **kwargs: Any) -> httpx.Response:
    resp = await get_http_client().request(method, url, **kwargs)
    resp.raise_for_status()
    return resp


async def fetch_json(
    method: str,
    url: str,
    *,
    cache_namespace: str | None = None,
    cache_ttl: int | None = None,
    cache_payload: Any | None = None,
    **kwargs: Any,
) -> Any:
    """Make a retried JSON request, optionally served from / written to cache.

    ``cache_payload`` (or the request kwargs) form the cache key. Pass
    ``cache_namespace`` + ``cache_ttl`` to enable caching for this call.
    """
    use_cache = cache_namespace is not None and cache_ttl is not None
    key = ""
    if use_cache:
        key = cache_key(cache_namespace, cache_payload if cache_payload is not None else kwargs)
        cached = await cache_get_json(key)
        if cached is not None:
            return cached

    resp = await _request(method, url, **kwargs)
    data = resp.json()

    if use_cache:
        await cache_set_json(key, data, cache_ttl)
    return data
