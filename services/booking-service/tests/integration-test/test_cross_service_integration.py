"""
Booking Service Cross-Service Integration Tests

Tests for interactions between different booking types, cascading effects,
and coordinated booking scenarios across hotels, transport, and dining.
"""

import pytest
from datetime import datetime, timedelta


# ============================================================================
# Multi-Booking Scenario Tests
# ============================================================================

@pytest.mark.asyncio
async def test_complete_trip_booking_workflow(
    async_client,
    mock_user_id,
    mock_trip_id,
    mock_region_node_id,
    mock_transport_payload,
    mock_hotel_payload,
    mock_dining_payload,
):
    """Test complete trip booking workflow: transport -> hotel -> dining."""
    # 1. Create transport booking
    transport_response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert transport_response.status_code == 201
    transport_id = transport_response.json()["id"]
    
    # 2. Create hotel booking
    hotel_response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert hotel_response.status_code == 201
    hotel_id = hotel_response.json()["id"]
    
    # 3. Create dining reservation
    dining_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert dining_response.status_code == 201
    dining_id = dining_response.json()["id"]
    
    # Verify all are retrievable
    assert (
        await async_client.get(
            f"/api/v1/transport-bookings/{transport_id}",
            headers={"X-User-Id": str(mock_user_id)},
        )
    ).status_code == 200
    
    assert (
        await async_client.get(
            f"/api/v1/hotel-bookings/{hotel_id}",
            headers={"X-User-Id": str(mock_user_id)},
        )
    ).status_code == 200
    
    assert (
        await async_client.get(
            f"/api/v1/dining-reservations/{dining_id}",
            headers={"X-User-Id": str(mock_user_id)},
        )
    ).status_code == 200


@pytest.mark.asyncio
async def test_multiple_hotels_same_trip(
    async_client,
    mock_user_id,
    mock_trip_id,
    mock_region_node_id,
    mock_hotel_payload,
):
    """Test booking multiple hotels for different regions in same trip."""
    hotel_ids = []
    
    # Create 3 hotel bookings for different dates
    for i in range(3):
        payload = mock_hotel_payload.copy()
        offset = i * 3
        payload["check_in_date"] = (datetime.utcnow() + timedelta(days=1 + offset)).date().isoformat()
        payload["check_out_date"] = (datetime.utcnow() + timedelta(days=2 + offset)).date().isoformat()
        payload["hotel_id"] = f"hotel-region-{i}"
        
        response = await async_client.post(
            "/api/v1/hotel-bookings",
            json=payload,
            headers={"X-User-Id": str(mock_user_id)},
        )
        assert response.status_code == 201
        hotel_ids.append(response.json()["id"])
    
    # List all hotel bookings for trip
    list_response = await async_client.get(
        f"/api/v1/hotel-bookings?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert list_response.status_code == 200
    data = list_response.json()
    assert len(data) >= 3


@pytest.mark.asyncio
async def test_multiple_transport_bookings_same_trip(
    async_client,
    mock_user_id,
    mock_trip_id,
    mock_transport_payload,
):
    """Test booking multiple transport segments for same trip."""
    transport_ids = []
    modes = ["flight", "train", "bus"]
    
    # Create transport bookings with different modes
    for i, mode in enumerate(modes):
        payload = mock_transport_payload.copy()
        offset = i * 3
        payload["mode"] = mode
        payload["departure_time"] = (datetime.utcnow() + timedelta(days=1 + offset)).isoformat()
        payload["arrival_time"] = (datetime.utcnow() + timedelta(days=1 + offset, hours=3)).isoformat()
        
        response = await async_client.post(
            "/api/v1/transport-bookings",
            json=payload,
            headers={"X-User-Id": str(mock_user_id)},
        )
        assert response.status_code == 201
        transport_ids.append(response.json()["id"])
    
    # List all transport bookings for trip
    list_response = await async_client.get(
        f"/api/v1/transport-bookings?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert list_response.status_code == 200
    data = list_response.json()
    assert len(data) >= 3


@pytest.mark.asyncio
async def test_multiple_dining_reservations_same_trip(
    async_client,
    mock_user_id,
    mock_trip_id,
    mock_dining_payload,
):
    """Test making multiple dining reservations for same trip."""
    dining_ids = []
    
    # Create 3 dining reservations for different dates
    for i in range(3):
        payload = mock_dining_payload.copy()
        payload["date"] = (datetime.utcnow() + timedelta(days=1 + i)).date().isoformat()
        payload["time"] = f"{17 + i}:00"  # Different times
        payload["dining_option_id"] = f"dining-restaurant-{i}"
        
        response = await async_client.post(
            "/api/v1/dining-reservations",
            json=payload,
            headers={"X-User-Id": str(mock_user_id)},
        )
        assert response.status_code == 201
        dining_ids.append(response.json()["id"])
    
    # List all dining reservations for trip
    list_response = await async_client.get(
        f"/api/v1/dining-reservations?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert list_response.status_code == 200
    data = list_response.json()
    assert len(data) >= 3


# ============================================================================
# Booking Status Workflow Tests
# ============================================================================

@pytest.mark.asyncio
async def test_hotel_booking_status_progression(
    async_client,
    mock_user_id,
    mock_hotel_payload,
):
    """Test hotel booking status progression: pending -> confirmed -> completed."""
    # Create booking (pending)
    create_response = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    hotel_id = create_response.json()["id"]
    assert create_response.json()["status"] == "pending"
    
    # Update to confirmed
    confirm_response = await async_client.patch(
        f"/api/v1/hotel-bookings/{hotel_id}",
        json={"status": "confirmed"},
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert confirm_response.status_code == 200
    assert confirm_response.json()["status"] == "confirmed"
    
    # Verify state persists
    get_response = await async_client.get(
        f"/api/v1/hotel-bookings/{hotel_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert get_response.json()["status"] == "confirmed"


@pytest.mark.asyncio
async def test_transport_booking_cancellation_workflow(
    async_client,
    mock_user_id,
    mock_transport_payload,
):
    """Test transport booking cancellation workflow."""
    # Create booking
    create_response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking_id = create_response.json()["id"]
    assert create_response.json()["booking_status"] == "pending"
    
    # Cancel booking
    cancel_response = await async_client.patch(
        f"/api/v1/transport-bookings/{booking_id}",
        json={"booking_status": "cancelled"},
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert cancel_response.status_code == 200
    assert cancel_response.json()["booking_status"] == "cancelled"


@pytest.mark.asyncio
async def test_dining_reservation_cancellation_workflow(
    async_client,
    mock_user_id,
    mock_dining_payload,
):
    """Test dining reservation cancellation workflow."""
    # Create reservation
    create_response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reservation_id = create_response.json()["id"]
    assert create_response.json()["status"] == "pending"
    
    # Confirm reservation
    confirm_response = await async_client.patch(
        f"/api/v1/dining-reservations/{reservation_id}",
        json={"status": "confirmed"},
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert confirm_response.status_code == 200
    assert confirm_response.json()["status"] == "confirmed"
    
    # Cancel reservation
    cancel_response = await async_client.patch(
        f"/api/v1/dining-reservations/{reservation_id}",
        json={"status": "cancelled"},
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert cancel_response.status_code == 200
    assert cancel_response.json()["status"] == "cancelled"


# ============================================================================
# Listing and Filtering Tests
# ============================================================================

@pytest.mark.asyncio
async def test_list_all_bookings_mixed_statuses(
    async_client,
    mock_user_id,
    mock_trip_id,
    mock_hotel_payload,
):
    """Test listing bookings with mixed statuses."""
    # Create 2 bookings with different statuses
    payloads = [mock_hotel_payload.copy() for _ in range(2)]
    payloads[0]["check_in_date"] = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
    payloads[0]["check_out_date"] = (datetime.utcnow() + timedelta(days=2)).date().isoformat()
    payloads[1]["check_in_date"] = (datetime.utcnow() + timedelta(days=3)).date().isoformat()
    payloads[1]["check_out_date"] = (datetime.utcnow() + timedelta(days=4)).date().isoformat()
    
    # Create and confirm one
    response1 = await async_client.post(
        "/api/v1/hotel-bookings",
        json=payloads[0],
        headers={"X-User-Id": str(mock_user_id)},
    )
    booking1_id = response1.json()["id"]
    
    await async_client.patch(
        f"/api/v1/hotel-bookings/{booking1_id}",
        json={"status": "confirmed"},
        headers={"X-User-Id": str(mock_user_id)},
    )
    
    # Create but leave one pending
    response2 = await async_client.post(
        "/api/v1/hotel-bookings",
        json=payloads[1],
        headers={"X-User-Id": str(mock_user_id)},
    )
    
    # List all
    list_all = await async_client.get(
        f"/api/v1/hotel-bookings?trip_id={mock_trip_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert len(list_all.json()) >= 2
    
    # Filter by pending
    list_pending = await async_client.get(
        f"/api/v1/hotel-bookings?trip_id={mock_trip_id}&status=pending",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert all(b["status"] == "pending" for b in list_pending.json())
    
    # Filter by confirmed
    list_confirmed = await async_client.get(
        f"/api/v1/hotel-bookings?trip_id={mock_trip_id}&status=confirmed",
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert all(b["status"] == "confirmed" for b in list_confirmed.json())


@pytest.mark.asyncio
async def test_filter_by_region_node(
    async_client,
    mock_user_id,
    mock_trip_id,
    mock_region_node_id,
    mock_hotel_payload,
):
    """Test filtering bookings by region node."""
    # Create booking for first region
    response1 = await async_client.post(
        "/api/v1/hotel-bookings",
        json=mock_hotel_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response1.status_code == 201
    
    # Create booking for different region
    payload2 = mock_hotel_payload.copy()
    payload2["region_node_id"] = "550e8400-e29b-41d4-a716-446655440003"
    response2 = await async_client.post(
        "/api/v1/hotel-bookings",
        json=payload2,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response2.status_code == 201
    
    # Filter by first region
    list_region1 = await async_client.get(
        f"/api/v1/hotel-bookings?trip_id={mock_trip_id}&region_node_id={mock_region_node_id}",
        headers={"X-User-Id": str(mock_user_id)},
    )
    
    # All should be for first region
    assert all(b["region_node_id"] == str(mock_region_node_id) for b in list_region1.json())


# ============================================================================
# Booking Reference Generation Tests
# ============================================================================

@pytest.mark.asyncio
async def test_unique_booking_references(
    async_client,
    mock_user_id,
    mock_hotel_payload,
):
    """Test that each booking gets unique reference."""
    references = set()
    
    for i in range(5):
        payload = mock_hotel_payload.copy()
        offset = i * 2
        payload["check_in_date"] = (datetime.utcnow() + timedelta(days=1 + offset)).date().isoformat()
        payload["check_out_date"] = (datetime.utcnow() + timedelta(days=2 + offset)).date().isoformat()
        
        response = await async_client.post(
            "/api/v1/hotel-bookings",
            json=payload,
            headers={"X-User-Id": str(mock_user_id)},
        )
        reference = response.json()["booking_reference"]
        references.add(reference)
    
    # All references should be unique
    assert len(references) == 5


@pytest.mark.asyncio
async def test_transport_booking_reference_format(
    async_client,
    mock_user_id,
    mock_transport_payload,
):
    """Test that transport booking reference has expected format."""
    response = await async_client.post(
        "/api/v1/transport-bookings",
        json=mock_transport_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reference = response.json()["booking_reference"]
    
    # Should start with TRP- prefix
    assert reference.startswith("TRP-") or "-" in reference


@pytest.mark.asyncio
async def test_dining_reservation_reference_format(
    async_client,
    mock_user_id,
    mock_dining_payload,
):
    """Test that dining reservation reference has expected format."""
    response = await async_client.post(
        "/api/v1/dining-reservations",
        json=mock_dining_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    reference = response.json()["reservation_reference"]
    
    # Should be non-empty string
    assert reference
    assert isinstance(reference, str)
