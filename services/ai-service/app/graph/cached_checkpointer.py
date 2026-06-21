from __future__ import annotations

import logging
from typing import Any

from langgraph.checkpoint.base import Checkpoint, CheckpointMetadata, CheckpointTuple
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool

from app.db.redis import cache_delete, cache_get_obj, cache_set_obj

logger = logging.getLogger(__name__)

class RedisCachedPostgresSaver(AsyncPostgresSaver):
    """An AsyncPostgresSaver that caches checkpoints in Redis."""

    def __init__(self, pool: AsyncConnectionPool) -> None:
        super().__init__(pool)

    def _get_cache_key(self, thread_id: str, checkpoint_ns: str, checkpoint_id: str) -> str:
        return f"checkpoint:{thread_id}:{checkpoint_ns}:{checkpoint_id}"

    async def aget_tuple(self, config: dict[str, Any]) -> CheckpointTuple | None:
        thread_id = config["configurable"].get("user_id", config["configurable"].get("thread_id", ""))
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"].get("checkpoint_id")

        if checkpoint_id:
            cache_key = self._get_cache_key(thread_id, checkpoint_ns, checkpoint_id)
        else:
            cache_key = self._get_cache_key(thread_id, checkpoint_ns, "latest")

        cached_tuple = await cache_get_obj(cache_key)
        if cached_tuple is not None:
            logger.debug(f"Cache HIT for {cache_key}")
            return cached_tuple

        logger.debug(f"Cache MISS for {cache_key}")
        db_tuple = await super().aget_tuple(config)

        if db_tuple is not None:
            ttl = 3600 * 24 if checkpoint_id else 600
            await cache_set_obj(cache_key, db_tuple, ttl=ttl)

        return db_tuple

    async def aput(
        self,
        config: dict[str, Any],
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: dict[str, str | float | int],
    ) -> dict[str, Any]:
        result = await super().aput(config, checkpoint, metadata, new_versions)

        thread_id = config["configurable"].get("user_id", config["configurable"].get("thread_id", ""))
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        
        latest_key = self._get_cache_key(thread_id, checkpoint_ns, "latest")
        specific_key = self._get_cache_key(thread_id, checkpoint_ns, checkpoint["id"])

        await cache_delete(latest_key)
        await cache_delete(specific_key)

        return result

    async def aput_writes(
        self,
        config: dict[str, Any],
        writes: list[tuple[str, Any]],
        task_id: str,
    ) -> None:
        await super().aput_writes(config, writes, task_id)

        thread_id = config["configurable"].get("user_id", config["configurable"].get("thread_id", ""))
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"].get("checkpoint_id")

        latest_key = self._get_cache_key(thread_id, checkpoint_ns, "latest")
        await cache_delete(latest_key)

        if checkpoint_id:
            specific_key = self._get_cache_key(thread_id, checkpoint_ns, checkpoint_id)
            await cache_delete(specific_key)
