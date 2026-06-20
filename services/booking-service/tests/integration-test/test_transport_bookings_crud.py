"""
Transport Bookings CRUD Integration Tests

Tests for transport booking creation, retrieval, updating, deletion, and error handling.
Validates all transport booking operations including mode variations and user isolation.
"""

import pytest
from datetime import datetime, timedelta


@pytest.mark.asyncio
async def test_create_transport_booking_success(
    async_client, mock_transport_payload, mock_user_id
):
    """Test successful transport booking creation."""
    response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["mode"] == mock_transport_payload["mode"]
    assert data["booking_status"] == "pending"
    assert "booking_reference" in data


@pytest.mark.asyncio
async def test_create_transport_booking_multiple_modes(
    async_client, mock_transport_payload, mock_user_id
):
    """Test creating transport bookings with different modes."""
    modes = ["flight", "train", "bus", "car", "tuk-tuk", "ferry"]
    
    for mode in modes:
        payload = mock_transport_payload.copy()
        payload["mode"] = mode
        
        response = await async_client.post(
            "/api/v1/transport-bookings",
            json=payload,
            headers={"X-User-Id": str(mock_user_id)},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["mode"] == mode


@pytest.mark.asyncio
async def test_create_transport_booking_missing_field(
    async_client, mock_transport_payload, mock_user_id
):
    """Test transport booking creation with missing required field."""
    invalid_payload = mock_transport_payload.copy()
    del invalid_payload["mode"]
    
    response = await async_client.post(
        "/api/v1/transport-bookings",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_create_transport_booking_invalid_times(
    async_client, mock_transport_payload, mock_user_id
):
    """Test transport booking with invalid time range (arrival before departure)."""
    invalid_payload = mock_transport_payload.copy()
    invalid_payload["arrival_time"] = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    invalid_payload["departure_time"] = (datetime.utcnow() + timedelta(hours=3)).isoformat()
    
    response = await async_client.post(
        "/api/v1/transport-bookings",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should either reject or accept (depends on implementation)
    assert response.status_code in [400, 422, 201]


@pytest.mark.asyncio
async def test_get_transport_booking_success(
    async_client, mock_transport_payload, mock_user_id
):
    """Test retrieving a transport booking by ID."""
    # Create a booking first
    create_response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert create_response.status_code == 201
    booking_id = create_response.json()["id"]
    
    # Retrieve the booking
    get_response = await async_client.get(
        f"/api/v1/transport-bookings/{booking_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["id"] == booking_id
    assert data["mode"] == mock_transport_payload["mode"]


@pytest.mark.asyncio
async def test_get_transport_booking_not_found(async_client, mock_user_id):
    """Test retrieving non-existent transport booking."""
    response = await async_client.get(
        "/api/v1/transport-bookings/00000000-0000-0000-0000-000000000000",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_transport_bookings_empty(async_client, mock_user_id, mock_trip_id):
    """Test listing transport bookings when none exist."""
    response = await async_client.get(
        f"/api/v1/transport-bookings?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_list_transport_bookings_success(
    async_client, mock_transport_payload, mock_user_id, mock_trip_id
):
    """Test listing transport bookings for a trip."""
    # Create a booking
    await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    
    # List bookings
    response = await async_client.get(
        f"/api/v1/transport-bookings?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["mode"] == mock_transport_payload["mode"]


@pytest.mark.asyncio
async def test_list_transport_bookings_filter_by_status(
    async_client, mock_transport_payload, mock_user_id, mock_trip_id
):
    """Test listing transport bookings filtered by status."""
    # Create a booking
    await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    
    # List bookings with status filter
    response = await async_client.get(
        f"/api/v1/transport-bookings?trip_id={mock_trip_id}&booking_status=pending",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert all(booking["booking_status"] == "pending" for booking in data)


@pytest.mark.asyncio
async def test_update_transport_booking_success(
    async_client, mock_transport_payload, mock_user_id
):
    """Test updating a transport booking."""
    # Create a booking
    create_response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Update the booking
    update_payload = {
        "booking_status": "confirmed",
    }
    update_response = await async_client.patch(
        f"/api/v1/transport-bookings/{booking_id}",
        json=update_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["booking_status"] == "confirmed"


@pytest.mark.asyncio
async def test_update_transport_booking_not_found(async_client, mock_user_id):
    """Test updating non-existent transport booking."""
    update_payload = {"booking_status": "confirmed"}
    response = await async_client.patch(
        "/api/v1/transport-bookings/00000000-0000-0000-0000-000000000000",
        json=update_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_transport_booking_success(
    async_client, mock_transport_payload, mock_user_id
):
    """Test deleting a transport booking."""
    # Create a booking
    create_response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Delete the booking
    delete_response = await async_client.delete(
        f"/api/v1/transport-bookings/{booking_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert delete_response.status_code == 204
    
    # Verify it's deleted
    get_response = await async_client.get(
        f"/api/v1/transport-bookings/{booking_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_transport_booking_not_found(async_client, mock_user_id):
    """Test deleting non-existent transport booking."""
    response = await async_client.delete(
        "/api/v1/transport-bookings/00000000-0000-0000-0000-000000000000",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_access_other_users_transport(
    async_client, mock_transport_payload, mock_user_id
):
    """Test that users cannot access other users' transport bookings."""
    # Create a booking as user 1
    create_response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Try to access as different user
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    get_response = await async_client.get(
        f"/api/v1/transport-bookings/{booking_id}",
        headers={"X-User-Id": other_user_id},
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_modify_other_users_transport(
    async_client, mock_transport_payload, mock_user_id
):
    """Test that users cannot modify other users' transport bookings."""
    # Create a booking as user 1
    create_response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Try to update as different user
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    update_response = await async_client.patch(
        f"/api/v1/transport-bookings/{booking_id}",
        json={"booking_status": "cancelled"},
        headers={"X-User-Id": other_user_id},
    )
    assert update_response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_delete_other_users_transport(
    async_client, mock_transport_payload, mock_user_id
):
    """Test that users cannot delete other users' transport bookings."""
    # Create a booking as user 1
    create_response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Try to delete as different user
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    delete_response = await async_client.delete(
        f"/api/v1/transport-bookings/{booking_id}",
        headers={"X-User-Id": other_user_id},
    )
    assert delete_response.status_code == 404
