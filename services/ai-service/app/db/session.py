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
    """Ensure the AI-domain schema and pgvector extension exist.

    Table creation is owned by Alembic migrations (``alembic upgrade head``),
    not by this function.
    """
    from sqlalchemy import text

    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.execute(
            text(f"CREATE SCHEMA IF NOT EXISTS {settings.postgres_schema}")
        )


async def close_db() -> None:
    await engine.dispose()
