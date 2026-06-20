import os
import sys
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import JSON, TypeDecorator, String, event
from sqlalchemy.dialects.postgresql import JSONB, UUID as PostgresUUID
from sqlalchemy.types import Uuid
from datetime import datetime, timedelta
import uuid

# Set test environment variables BEFORE importing app
os.environ.setdefault("AUTH_DISABLED", "true")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("ENVIRONMENT", "test")

# Mock asyncpg before importing app to prevent PostgreSQL connection at import time
sys.modules['asyncpg'] = MagicMock()

# Now import the app
from app.main import app
from app.core.database import Base, get_db


# Custom UUID type for SQLite compatibility
class SQLiteUUID(TypeDecorator):
    """Platform-independent UUID type that uses binary in PostgreSQL and String in SQLite."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return uuid.UUID(value) if isinstance(value, str) else value


# Helper function to replace JSONB columns with JSON for SQLite compatibility
def _convert_jsonb_to_json_for_sqlite():
    """Convert JSONB columns to JSON and UUID to String for SQLite testing."""
    
    for table in Base.metadata.tables.values():
        for column in table.columns:
            if isinstance(column.type, JSONB):
                # Replace JSONB with portable JSON type
                column.type = JSON()
            elif isinstance(column.type, (PostgresUUID, Uuid)):
                # Replace PostgreSQL UUID with custom SQLiteUUID type
                column.type = SQLiteUUID()


# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def test_db():
    """Create test database with all tables."""
    # Convert JSONB and UUID types for SQLite compatibility
    _convert_jsonb_to_json_for_sqlite()
    
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False}
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session factory
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    yield async_session
    
    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture
async def async_client(test_db):
    """Create test client with test database session."""
    
    async def override_get_db():
        async with test_db() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture
def mock_user_id():
    """Mock user ID for testing."""
    return "test-user-123"


@pytest.fixture
def mock_trip_payload():
    """Create mock trip payload."""
    return {
        "title": "Sri Lanka Adventure",
        "destination": "Colombo, Sri Lanka",
        "start_date": (datetime.now() + timedelta(days=10)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=20)).isoformat(),
        "budget": 5000.0,
        "currency": "USD",
        "preferences": {
            "travel_style": "adventure",
            "interests": ["beaches", "temples", "wildlife"]
        }
    }


@pytest.fixture
def mock_region_payload():
    """Create mock region node payload."""
    return {
        "name": "Colombo",
        "start_date": (datetime.now() + timedelta(days=10)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=12)).isoformat(),
        "sequence": 1
    }


@pytest.fixture
def mock_location_payload():
    """Create mock location selection payload."""
    return {
        "location_id": "loc-001",
        "location_name": "Sigiriya Rock",
        "visit_date": (datetime.now() + timedelta(days=15)).isoformat(),
        "visit_time": "09:00",
        "duration_scheduled": 180  # minutes
    }


@pytest.fixture
def mock_alert_payload():
    """Create mock alert payload."""
    return {
        "type": "delay",
        "severity": "medium",
        "description": "Train delayed by 2 hours",
        "affected_region_id": "region-001",
        "delay_minutes": 120
    }
