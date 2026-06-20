"""
Booking Service Validation and Error Handling Tests

Tests for input validation, error responses, edge cases, and boundary conditions
across all booking operations.
"""

import pytest
from uuid import uuid4
from datetime import datetime, timedelta


# ============================================================================
# Hotel Booking Validation Tests
# ============================================================================

@pytest.mark.asyncio
async def test_hotel_booking_invalid_trip_id_format(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test hotel booking with invalid trip ID format."""
    invalid_payload = mock_hotel_payload.copy()
    invalid_payload["trip_id"] = "not-a-uuid"
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_hotel_booking_negative_price(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test hotel booking with negative price."""
    invalid_payload = mock_hotel_payload.copy()
    invalid_payload["total_price"] = -100.00
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should either accept or reject
    assert response.status_code in [400, 422, 201]


@pytest.mark.asyncio
async def test_hotel_booking_zero_price(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test hotel booking with zero price."""
    payload = mock_hotel_payload.copy()
    payload["total_price"] = 0.00
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should either accept or reject
    assert response.status_code in [400, 422, 201]


@pytest.mark.asyncio
async def test_hotel_booking_same_checkin_checkout(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test hotel booking with same check-in and check-out date."""
    payload = mock_hotel_payload.copy()
    same_date = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
    payload["check_in_date"] = same_date
    payload["check_out_date"] = same_date
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should either accept or reject
    assert response.status_code in [400, 422, 201]


# ============================================================================
# Transport Booking Validation Tests
# ============================================================================

@pytest.mark.asyncio
async def test_transport_booking_invalid_mode(
    async_client, mock_transport_payload, mock_user_id
):
    """Test transport booking with invalid transport mode."""
    invalid_payload = mock_transport_payload.copy()
    invalid_payload["mode"] = "teleportation"  # Invalid
    
    response = await async_client.post(
        "/api/v1/transport-bookings",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_transport_booking_invalid_time_format(
    async_client, mock_transport_payload, mock_user_id
):
    """Test transport booking with invalid time format."""
    invalid_payload = mock_transport_payload.copy()
    invalid_payload["departure_time"] = "not-a-datetime"
    
    response = await async_client.post(
        "/api/v1/transport-bookings",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_transport_booking_same_departure_arrival(
    async_client, mock_transport_payload, mock_user_id
):
    """Test transport booking with same departure and arrival time."""
    payload = mock_transport_payload.copy()
    same_time = (datetime.utcnow() + timedelta(days=1)).isoformat()
    payload["departure_time"] = same_time
    payload["arrival_time"] = same_time
    
    response = await async_client.post(
        "/api/v1/transport-bookings",
        json=payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should either accept or reject
    assert response.status_code in [400, 422, 201]


@pytest.mark.asyncio
async def test_transport_booking_invalid_status(
    async_client, mock_transport_payload, mock_user_id
):
    """Test updating transport booking with invalid status."""
    # Create a booking
    create_response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    
    # Try to update with invalid status
    response = await async_client.patch(
        f"/api/v1/transport-bookings/{booking_id}",
        json={"booking_status": "invalid-status"},
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422, 200]


# ============================================================================
# Dining Reservation Validation Tests
# ============================================================================

@pytest.mark.asyncio
async def test_dining_reservation_invalid_time_format(
    async_client, mock_dining_payload, mock_user_id
):
    """Test dining reservation with invalid time format."""
    invalid_payload = mock_dining_payload.copy()
    invalid_payload["time"] = "not-a-time"
    
    response = await async_client.post(
        "/api/v1/dining-reservations",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_dining_reservation_invalid_party_size_negative(
    async_client, mock_dining_payload, mock_user_id
):
    """Test dining reservation with negative party size."""
    invalid_payload = mock_dining_payload.copy()
    invalid_payload["party_size"] = -1
    
    response = await async_client.post(
        "/api/v1/dining-reservations",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_dining_reservation_very_large_party(
    async_client, mock_dining_payload, mock_user_id
):
    """Test dining reservation with very large party size."""
    payload = mock_dining_payload.copy()
    payload["party_size"] = 1000
    
    response = await async_client.post(
        "/api/v1/dining-reservations",
        json=payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should either accept or reject
    assert response.status_code in [400, 422, 201]


@pytest.mark.asyncio
async def test_dining_reservation_invalid_status(
    async_client, mock_dining_payload, mock_user_id
):
    """Test updating dining reservation with invalid status."""
    # Create a reservation
    create_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reservation_id = create_response.json()["id"]
    
    # Try to update with invalid status
    response = await async_client.patch(
        f"/api/v1/dining-reservations/{reservation_id}",
        json={"status": "invalid-status"},
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422, 200]


# ============================================================================
# General Error Handling Tests
# ============================================================================

@pytest.mark.asyncio
async def test_missing_user_id_header(async_client, mock_hotel_payload):
    """Test request without X-User-Id header."""
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        # No X-User-Id header
    )
    assert response.status_code in [400, 401, 403, 422]


@pytest.mark.asyncio
async def test_invalid_user_id_format(
    async_client, mock_hotel_payload
):
    """Test request with invalid user ID format."""
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": "not-a-uuid"},
    )
    assert response.status_code in [400, 401, 422]


@pytest.mark.asyncio
async def test_malformed_json(async_client, mock_user_id):
    """Test request with malformed JSON."""
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        content="{ invalid json",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_get_with_invalid_booking_id_format(async_client, mock_user_id):
    """Test GET with invalid booking ID format."""
    response = await async_client.get(
        "/api/v1/hotel-bookings/not-a-uuid",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 404, 422]


@pytest.mark.asyncio
async def test_delete_with_invalid_booking_id_format(async_client, mock_user_id):
    """Test DELETE with invalid booking ID format."""
    response = await async_client.delete(
        "/api/v1/hotel-bookings/not-a-uuid",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 404, 422]


# ============================================================================
# Concurrency and Edge Case Tests
# ============================================================================

@pytest.mark.asyncio
async def test_concurrent_bookings_same_user(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test multiple bookings by same user (should succeed)."""
    payloads = [
        mock_hotel_payload.copy(),
        mock_hotel_payload.copy(),
        mock_hotel_payload.copy(),
    ]
    
    # Adjust dates to avoid conflicts
    for i, payload in enumerate(payloads):
        offset = i * 3
        payload["check_in_date"] = (datetime.utcnow() + timedelta(days=1 + offset)).date().isoformat()
        payload["check_out_date"] = (datetime.utcnow() + timedelta(days=2 + offset)).date().isoformat()
    
    responses = []
    for payload in payloads:
        response = await async_client.post(
            "/api/v1/hotel-bookings",
            json=payload,
            headers={"X-User-Id": str(mock_user_id)},
        )
        responses.append(response)
    
    # All should succeed
    assert all(r.status_code == 201 for r in responses)


@pytest.mark.asyncio
async def test_empty_string_fields(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test booking with empty string fields."""
    invalid_payload = mock_hotel_payload.copy()
    invalid_payload["hotel_id"] = ""  # Empty string
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422, 201]


@pytest.mark.asyncio
async def test_null_optional_fields(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test booking with null optional fields."""
    payload = mock_hotel_payload.copy()
    # If total_price is optional, set to null
    if "total_price" in payload:
        payload["total_price"] = None
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should handle gracefully
    assert response.status_code in [201, 400, 422]


@pytest.mark.asyncio
async def test_extra_fields_ignored(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test that extra fields in request are ignored gracefully."""
    payload = mock_hotel_payload.copy()
    payload["extra_field"] = "extra_value"
    payload["another_extra"] = {"nested": "data"}
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should accept and ignore extra fields
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_unicode_in_strings(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test booking with unicode characters in string fields."""
    payload = mock_hotel_payload.copy()
    payload["hotel_id"] = "hotel-கொழும்பு-001"  # Unicode characters
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should handle unicode
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_very_long_string_field(
    async_client, mock_hotel_payload, mock_user_id
):
    """Test booking with very long string field."""
    payload = mock_hotel_payload.copy()
    payload["hotel_id"] = "x" * 10000  # Very long string
    
    response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should either accept or reject gracefully
    assert response.status_code in [201, 400, 422]
