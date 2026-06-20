"""Async SQLAlchemy engine and session for PostgreSQL (with pgvector)."""
from collections.abc import AsyncGenerator

from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    """Declarative base for all AI-domain ORM models."""

    metadata = MetaData(schema=settings.postgres_schema)


engine: AsyncEngine = create_async_engine(
    settings.postgres_dsn,
    pool_pre_ping=True,
    future=True,
)

SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a database session."""
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Ensure the AI-domain schema, pgvector extension, and all ORM tables exist.

    Uses SQLAlchemy ``create_all`` to create tables that don't exist yet.
    This is idempotent (checkfirst=True) and runs on every startup.
    Alembic migrations are still used for schema *changes* after initial creation.
    """
    import app.models  # noqa: F401 — register all ORM models on Base.metadata

    from sqlalchemy import text

    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.execute(
            text(f"CREATE SCHEMA IF NOT EXISTS {settings.postgres_schema}")
        )
        # Create all tables declared on Base that don't yet exist.
        await conn.run_sync(Base.metadata.create_all, checkfirst=True)


async def close_db() -> None:
    await engine.dispose()
