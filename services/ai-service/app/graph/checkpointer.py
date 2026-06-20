from __future__ import annotations

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

from app.core.config import settings

_pool: AsyncConnectionPool | None = None
_checkpointer: AsyncPostgresSaver | None = None


async def init_checkpointer() -> AsyncPostgresSaver:

    global _pool, _checkpointer

    if _checkpointer is not None:
        return _checkpointer

    _pool = AsyncConnectionPool(
        conninfo=settings.postgres_psycopg_dsn,
        max_size=20,
        open=False,
        kwargs={"autocommit": True, "row_factory": dict_row},
    )
    await _pool.open()

    _checkpointer = AsyncPostgresSaver(_pool)
    # Auto-creates the LangGraph checkpoint tables if they do not exist.
    await _checkpointer.setup()
    return _checkpointer


def get_checkpointer() -> AsyncPostgresSaver:

    if _checkpointer is None:
        raise RuntimeError(
            "Checkpointer not initialized. Call init_checkpointer() on startup."
        )
    return _checkpointer


async def close_checkpointer() -> None:

    global _pool, _checkpointer
    if _pool is not None:
        await _pool.close()
    _pool = None
    _checkpointer = None
