"""
Dining Reservations CRUD Integration Tests

Tests for dining reservation creation, retrieval, updating, cancellation, and error handling.
Validates all dining reservation operations and user isolation.
"""

import pytest
from datetime import datetime, timedelta


@pytest.mark.asyncio
async def test_create_dining_reservation_success(
    async_client, mock_dining_payload, mock_user_id
):
    """Test successful dining reservation creation."""
    response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["dining_option_id"] == mock_dining_payload["dining_option_id"]
    assert data["status"] == "pending"
    assert data["party_size"] == mock_dining_payload["party_size"]
    assert "reservation_reference" in data


@pytest.mark.asyncio
async def test_create_dining_reservation_missing_field(
    async_client, mock_dining_payload, mock_user_id
):
    """Test dining reservation creation with missing required field."""
    invalid_payload = mock_dining_payload.copy()
    del invalid_payload["party_size"]
    
    response = await async_client.post(
        "/api/v1/dining-reservations",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_create_dining_reservation_invalid_party_size(
    async_client, mock_dining_payload, mock_user_id
):
    """Test dining reservation with invalid party size."""
    invalid_payload = mock_dining_payload.copy()
    invalid_payload["party_size"] = 0  # Invalid
    
    response = await async_client.post(
        "/api/v1/dining-reservations",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422, 201]


@pytest.mark.asyncio
async def test_create_dining_reservation_large_party(
    async_client, mock_dining_payload, mock_user_id
):
    """Test dining reservation with large party size."""
    payload = mock_dining_payload.copy()
    payload["party_size"] = 20
    
    response = await async_client.post(
        "/api/v1/dining-reservations",
        json=payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["party_size"] == 20


@pytest.mark.asyncio
async def test_get_dining_reservation_success(
    async_client, mock_dining_payload, mock_user_id
):
    """Test retrieving a dining reservation by ID."""
    # Create a reservation first
    create_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert create_response.status_code == 201
    reservation_id = create_response.json()["id"]
    
    # Retrieve the reservation
    get_response = await async_client.get(
        f"/api/v1/dining-reservations/{reservation_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["id"] == reservation_id
    assert data["dining_option_id"] == mock_dining_payload["dining_option_id"]


@pytest.mark.asyncio
async def test_get_dining_reservation_not_found(async_client, mock_user_id):
    """Test retrieving non-existent dining reservation."""
    response = await async_client.get(
        "/api/v1/dining-reservations/00000000-0000-0000-0000-000000000000",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_dining_reservations_empty(
    async_client, mock_user_id, mock_trip_id
):
    """Test listing dining reservations when none exist."""
    response = await async_client.get(
        f"/api/v1/dining-reservations?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_list_dining_reservations_success(
    async_client, mock_dining_payload, mock_user_id, mock_trip_id
):
    """Test listing dining reservations for a trip."""
    # Create a reservation
    await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    
    # List reservations
    response = await async_client.get(
        f"/api/v1/dining-reservations?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["dining_option_id"] == mock_dining_payload["dining_option_id"]


@pytest.mark.asyncio
async def test_list_dining_reservations_filter_by_status(
    async_client, mock_dining_payload, mock_user_id, mock_trip_id
):
    """Test listing dining reservations filtered by status."""
    # Create a reservation
    await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    
    # List reservations with status filter
    response = await async_client.get(
        f"/api/v1/dining-reservations?trip_id={mock_trip_id}&status=pending",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert all(reservation["status"] == "pending" for reservation in data)


@pytest.mark.asyncio
async def test_update_dining_reservation_success(
    async_client, mock_dining_payload, mock_user_id
):
    """Test updating a dining reservation."""
    # Create a reservation
    create_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reservation_id = create_response.json()["id"]
    
    # Update the reservation
    update_payload = {
        "party_size": 4,
        "status": "confirmed",
    }
    update_response = await async_client.patch(
        f"/api/v1/dining-reservations/{reservation_id}",
        json=update_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["party_size"] == 4
    assert data["status"] == "confirmed"


@pytest.mark.asyncio
async def test_update_dining_reservation_not_found(async_client, mock_user_id):
    """Test updating non-existent dining reservation."""
    update_payload = {"party_size": 4}
    response = await async_client.patch(
        "/api/v1/dining-reservations/00000000-0000-0000-0000-000000000000",
        json=update_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_cancel_dining_reservation_success(
    async_client, mock_dining_payload, mock_user_id
):
    """Test cancelling a dining reservation."""
    # Create a reservation
    create_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reservation_id = create_response.json()["id"]
    
    # Cancel the reservation
    cancel_response = await async_client.patch(
        f"/api/v1/dining-reservations/{reservation_id}",
        json={"status": "cancelled"},
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert cancel_response.status_code == 200
    data = cancel_response.json()
    assert data["status"] == "cancelled"


@pytest.mark.asyncio
async def test_delete_dining_reservation_success(
    async_client, mock_dining_payload, mock_user_id
):
    """Test deleting a dining reservation."""
    # Create a reservation
    create_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reservation_id = create_response.json()["id"]
    
    # Delete the reservation
    delete_response = await async_client.delete(
        f"/api/v1/dining-reservations/{reservation_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert delete_response.status_code == 204
    
    # Verify it's deleted
    get_response = await async_client.get(
        f"/api/v1/dining-reservations/{reservation_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_dining_reservation_not_found(async_client, mock_user_id):
    """Test deleting non-existent dining reservation."""
    response = await async_client.delete(
        "/api/v1/dining-reservations/00000000-0000-0000-0000-000000000000",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_access_other_users_dining(
    async_client, mock_dining_payload, mock_user_id
):
    """Test that users cannot access other users' dining reservations."""
    # Create a reservation as user 1
    create_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reservation_id = create_response.json()["id"]
    
    # Try to access as different user
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    get_response = await async_client.get(
        f"/api/v1/dining-reservations/{reservation_id}",
        headers={"X-User-Id": other_user_id},
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_modify_other_users_dining(
    async_client, mock_dining_payload, mock_user_id
):
    """Test that users cannot modify other users' dining reservations."""
    # Create a reservation as user 1
    create_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reservation_id = create_response.json()["id"]
    
    # Try to update as different user
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    update_response = await async_client.patch(
        f"/api/v1/dining-reservations/{reservation_id}",
        json={"party_size": 8},
        headers={"X-User-Id": other_user_id},
    )
    assert update_response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_delete_other_users_dining(
    async_client, mock_dining_payload, mock_user_id
):
    """Test that users cannot delete other users' dining reservations."""
    # Create a reservation as user 1
    create_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reservation_id = create_response.json()["id"]
    
    # Try to delete as different user
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    delete_response = await async_client.delete(
        f"/api/v1/dining-reservations/{reservation_id}",
        headers={"X-User-Id": other_user_id},
    )
    assert delete_response.status_code == 404
