"""
Booking Service Integration Test Fixtures

Provides database setup, test client, and mock data for all integration tests.
Uses SQLite in-memory database with type compatibility layer for testing.
"""

import pytest
import pytest_asyncio
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy import Column, String, TypeDecorator, event
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient
from starlette.testclient import ASGITransport

from app.main import app
from app.core.database import Base, get_db
from app.models import TransportBooking, HotelBooking, DiningReservation


# ============================================================================
# Type Compatibility Layer for SQLite Testing
# ============================================================================

class SQLiteUUID(TypeDecorator):
    """SQLite UUID type decorator.
    
    SQLite doesn't natively support UUID, so we store as String(36) and convert
    to/from UUID objects on retrieval/binding.
    """
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, UUID):
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return UUID(value) if isinstance(value, str) else value


def _convert_uuid_and_jsonb_for_sqlite(base):
    """Convert PostgreSQL UUID and JSONB types to SQLite-compatible types.
    
    Replaces PostgresUUID with SQLiteUUID and JSONB with JSON for SQLite compatibility.
    Must be called before creating tables.
    """
    from sqlalchemy import UUID as PostgresUUID, Text, JSON
    from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
    
    for table in base.metadata.tables.values():
        for column in table.columns:
            # Convert PostgreSQL UUID to SQLiteUUID
            if isinstance(column.type, (PostgresUUID, PG_UUID)):
                column.type = SQLiteUUID()
            
            # Convert JSONB to JSON (SQLite compatible)
            if isinstance(column.type, JSONB):
                column.type = JSON()


# ============================================================================
# Database Fixtures
# ============================================================================

@pytest_asyncio.fixture
async def test_db():
    """Create an in-memory SQLite database for testing.
    
    Yields an async session factory and cleans up after the test.
    """
    # Create in-memory SQLite engine with async support
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Convert PostgreSQL types to SQLite-compatible types
    _convert_uuid_and_jsonb_for_sqlite(Base)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create async session factory
    async_session_factory = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    # Override get_db dependency
    async def override_get_db():
        async with async_session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    yield async_session_factory

    # Cleanup
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest_asyncio.fixture
async def async_client(test_db):
    """Create an async HTTP client for testing the FastAPI app.
    
    Uses ASGITransport to test the ASGI app directly.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


# ============================================================================
# Mock Data Fixtures
# ============================================================================

@pytest.fixture
def mock_user_id():
    """Return a mock user ID for testing."""
    return UUID("550e8400-e29b-41d4-a716-446655440000")


@pytest.fixture
def mock_trip_id():
    """Return a mock trip ID for testing."""
    return UUID("550e8400-e29b-41d4-a716-446655440001")


@pytest.fixture
def mock_region_node_id():
    """Return a mock region node ID for testing."""
    return UUID("550e8400-e29b-41d4-a716-446655440002")


@pytest.fixture
def mock_transport_payload(mock_user_id, mock_trip_id, mock_region_node_id):
    """Return mock transport booking payload."""
    return {
        "trip_id": str(mock_trip_id),
        "region_node_id": str(mock_region_node_id),
        "mode": "train",
        "departure_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
        "arrival_time": (datetime.utcnow() + timedelta(days=1, hours=3)).isoformat(),
    }


@pytest.fixture
def mock_hotel_payload(mock_user_id, mock_trip_id, mock_region_node_id):
    """Return mock hotel booking payload."""
    return {
        "trip_id": str(mock_trip_id),
        "region_node_id": str(mock_region_node_id),
        "hotel_id": "hotel-kandy-001",
        "check_in_date": (datetime.utcnow() + timedelta(days=1)).date().isoformat(),
        "check_out_date": (datetime.utcnow() + timedelta(days=3)).date().isoformat(),
        "total_price": 250.00,
    }


@pytest.fixture
def mock_dining_payload(mock_user_id, mock_trip_id, mock_region_node_id):
    """Return mock dining reservation payload."""
    return {
        "trip_id": str(mock_trip_id),
        "region_node_id": str(mock_region_node_id),
        "dining_option_id": "dining-colombo-001",
        "date": (datetime.utcnow() + timedelta(days=1)).date().isoformat(),
        "time": "19:00",
        "party_size": 2,
    }


@pytest.fixture
def mock_hotel_search_payload(mock_region_node_id):
    """Return mock hotel search payload."""
    return {
        "region_node_id": str(mock_region_node_id),
        "check_in_date": (datetime.utcnow() + timedelta(days=1)).date().isoformat(),
        "check_out_date": (datetime.utcnow() + timedelta(days=3)).date().isoformat(),
    }


# ============================================================================
# Helper Functions for Tests
# ============================================================================

async def create_transport_booking(
    async_client, mock_transport_payload, mock_user_id
):
    """Helper to create a transport booking and return response."""
    response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    return response


async def create_hotel_booking(async_client, mock_hotel_payload, mock_user_id):
    """Helper to create a hotel booking and return response."""
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    return response


async def create_dining_reservation(async_client, mock_dining_payload, mock_user_id):
    """Helper to create a dining reservation and return response."""
    response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    return response
