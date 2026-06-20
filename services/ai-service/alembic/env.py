"""Alembic environment for the AI service (async engine + pgvector)."""
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.db.session import Base

# Import models so they register on Base.metadata.
import app.models  # noqa: F401, E402

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
VERSION_SCHEMA = settings.postgres_schema


def include_object(obj, name, type_, reflected, compare_to):
    # Only manage tables in our domain schema. The LangGraph checkpointer
    # creates its own tables (in the public schema) via saver.setup(), so
    # those must be ignored by autogenerate.
    if type_ == "table" and obj.schema != VERSION_SCHEMA:
        return False
    return True


def run_migrations_offline() -> None:
    context.configure(
        url=settings.postgres_dsn,
        target_metadata=target_metadata,
        literal_binds=True,
        include_schemas=True,
        version_table_schema=VERSION_SCHEMA,
        include_object=include_object,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    # Ensure schema + extension exist before migration (idempotent).
    connection.exec_driver_sql(f"CREATE SCHEMA IF NOT EXISTS {VERSION_SCHEMA}")
    connection.exec_driver_sql("CREATE EXTENSION IF NOT EXISTS vector")
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=True,
        version_table_schema=VERSION_SCHEMA,
        include_object=include_object,
        compare_type=True,
        transaction_per_migration=True,
    )
    context.run_migrations()


async def run_migrations_online() -> None:
    # Build the async engine directly from settings to avoid ini-section URL issues.
    connectable = create_async_engine(
        settings.postgres_dsn,
        poolclass=pool.NullPool,
    )
    async with connectable.begin() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
