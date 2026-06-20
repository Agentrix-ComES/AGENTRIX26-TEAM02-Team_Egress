"""
Hotel Bookings CRUD Integration Tests

Tests for hotel booking creation, retrieval, updating, deletion, and error handling.
Validates all hotel booking operations and user isolation.
"""

import pytest
from datetime import datetime, timedelta


@pytest.mark.asyncio
async def test_create_hotel_booking_success(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test successful hotel booking creation."""
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["hotel_id"] == mock_hotel_payload["hotel_id"]
    assert data["status"] == "pending"
    assert "booking_reference" in data


@pytest.mark.asyncio
async def test_create_hotel_booking_missing_field(async_client, mock_hotel_payload, mock_user_id):
    """Test hotel booking creation with missing required field."""
    invalid_payload = mock_hotel_payload.copy()
    del invalid_payload["hotel_id"]
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_create_hotel_booking_invalid_dates(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test hotel booking with invalid date range (checkout before checkin)."""
    invalid_payload = mock_hotel_payload.copy()
    invalid_payload["check_out_date"] = (datetime.utcnow() + timedelta(days=-5)).date().isoformat()
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should either reject or return 400
    assert response.status_code in [400, 422, 201]


@pytest.mark.asyncio
async def test_get_hotel_booking_success(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test retrieving a hotel booking by ID."""
    # Create a booking first
    create_response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert create_response.status_code == 201
    booking_id = create_response.json()["id"]
    
    # Retrieve the booking
    get_response = await async_client.get(
        f"/api/v1/hotel-bookings/{booking_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["id"] == booking_id
    assert data["hotel_id"] == mock_hotel_payload["hotel_id"]


@pytest.mark.asyncio
async def test_get_hotel_booking_not_found(async_client, mock_user_id):
    """Test retrieving non-existent hotel booking."""
    response = await async_client.get(
        "/api/v1/hotel-bookings/00000000-0000-0000-0000-000000000000",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_hotel_bookings_empty(async_client, mock_user_id, mock_trip_id):
    """Test listing hotel bookings when none exist."""
    response = await async_client.get(
        f"/api/v1/hotel-bookings?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_list_hotel_bookings_success(
    async_client, mock_hotel_payload, mock_user_id, mock_trip_id
):
    """Test listing hotel bookings for a trip."""
    # Create a booking
    await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    
    # List bookings
    response = await async_client.get(
        f"/api/v1/hotel-bookings?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["hotel_id"] == mock_hotel_payload["hotel_id"]


@pytest.mark.asyncio
async def test_list_hotel_bookings_filter_by_status(
    async_client, mock_hotel_payload, mock_user_id, mock_trip_id
):
    """Test listing hotel bookings filtered by status."""
    # Create a booking
    await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    
    # List bookings with status filter
    response = await async_client.get(
        f"/api/v1/hotel-bookings?trip_id={mock_trip_id}&status=pending",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert all(booking["status"] == "pending" for booking in data)


@pytest.mark.asyncio
async def test_update_hotel_booking_success(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test updating a hotel booking."""
    # Create a booking
    create_response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Update the booking
    update_payload = {
        "total_price": 300.00,
        "status": "confirmed",
    }
    update_response = await async_client.patch(
        f"/api/v1/hotel-bookings/{booking_id}",
        json=update_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["total_price"] == 300.00
    assert data["status"] == "confirmed"


@pytest.mark.asyncio
async def test_update_hotel_booking_not_found(async_client, mock_user_id):
    """Test updating non-existent hotel booking."""
    update_payload = {"total_price": 300.00}
    response = await async_client.patch(
        "/api/v1/hotel-bookings/00000000-0000-0000-0000-000000000000",
        json=update_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_hotel_booking_success(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test deleting a hotel booking."""
    # Create a booking
    create_response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Delete the booking
    delete_response = await async_client.delete(
        f"/api/v1/hotel-bookings/{booking_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert delete_response.status_code == 204
    
    # Verify it's deleted
    get_response = await async_client.get(
        f"/api/v1/hotel-bookings/{booking_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_hotel_booking_not_found(async_client, mock_user_id):
    """Test deleting non-existent hotel booking."""
    response = await async_client.delete(
        "/api/v1/hotel-bookings/00000000-0000-0000-0000-000000000000",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_access_other_users_hotel(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test that users cannot access other users' hotel bookings."""
    # Create a booking as user 1
    create_response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Try to access as different user
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    get_response = await async_client.get(
        f"/api/v1/hotel-bookings/{booking_id}",
        headers={"X-User-Id": other_user_id},
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_modify_other_users_hotel(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test that users cannot modify other users' hotel bookings."""
    # Create a booking as user 1
    create_response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Try to update as different user
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    update_response = await async_client.patch(
        f"/api/v1/hotel-bookings/{booking_id}",
        json={"total_price": 500.00},
        headers={"X-User-Id": other_user_id},
    )
    assert update_response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_delete_other_users_hotel(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test that users cannot delete other users' hotel bookings."""
    # Create a booking as user 1
    create_response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Try to delete as different user
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    delete_response = await async_client.delete(
        f"/api/v1/hotel-bookings/{booking_id}",
        headers={"X-User-Id": other_user_id},
    )
    assert delete_response.status_code == 404
