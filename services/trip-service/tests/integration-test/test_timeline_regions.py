import pytest
from datetime import datetime, timedelta


async def create_trip(async_client, mock_trip_payload, user_id):
    """Helper to create a trip."""
    headers = {"X-User-ID": user_id}
    response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers
    )
    assert response.status_code == 201
    return response.json()["id"]


@pytest.mark.asyncio
async def test_create_region_success(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test successful region creation."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=mock_region_payload,
        headers=headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Colombo"
    assert data["sequence"] == 1
    assert data["state"] == "green"  # Default state


@pytest.mark.asyncio
async def test_create_region_invalid_dates(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test region creation fails with invalid date range."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    payload = {**mock_region_payload}
    payload["end_date"] = (datetime.now() + timedelta(days=11)).isoformat()
    payload["start_date"] = (datetime.now() + timedelta(days=12)).isoformat()
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_region_outside_trip_bounds(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test region creation fails when dates are outside trip bounds."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    payload = {**mock_region_payload}
    # Set region dates outside trip bounds
    payload["start_date"] = (datetime.now() + timedelta(days=1)).isoformat()
    payload["end_date"] = (datetime.now() + timedelta(days=5)).isoformat()
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=payload,
        headers=headers
    )
    
    # Should fail or return error
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_get_region_success(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test retrieving a region by ID."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create region
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=mock_region_payload,
        headers=headers
    )
    region_id = create_response.json()["id"]
    
    # Get region
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == region_id
    assert data["name"] == "Colombo"


@pytest.mark.asyncio
async def test_get_region_not_found(async_client, mock_trip_payload, mock_user_id):
    """Test getting non-existent region returns 404."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/nonexistent-region",
        headers=headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_regions_empty(async_client, mock_trip_payload, mock_user_id):
    """Test listing regions when none exist."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data == [] or data.get("items") == []


@pytest.mark.asyncio
async def test_list_regions_multiple(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test listing multiple regions in chronological order."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create first region
    region1_payload = {**mock_region_payload, "name": "Colombo", "sequence": 1}
    await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=region1_payload,
        headers=headers
    )
    
    # Create second region
    region2_payload = {
        **mock_region_payload,
        "name": "Kandy",
        "start_date": (datetime.now() + timedelta(days=13)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=15)).isoformat(),
        "sequence": 2
    }
    await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=region2_payload,
        headers=headers
    )
    
    # List regions
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Verify they're in order
    assert data[0]["sequence"] == 1
    assert data[1]["sequence"] == 2


@pytest.mark.asyncio
async def test_update_region_success(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test updating a region."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create region
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=mock_region_payload,
        headers=headers
    )
    region_id = create_response.json()["id"]
    
    # Update region
    update_payload = {"name": "Updated Colombo", "state": "red"}
    response = await async_client.patch(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        json=update_payload,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Colombo"
    assert data["state"] == "red"


@pytest.mark.asyncio
async def test_delete_region_success(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test deleting a region."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create region
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=mock_region_payload,
        headers=headers
    )
    region_id = create_response.json()["id"]
    
    # Delete region
    response = await async_client.delete(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        headers=headers
    )
    
    assert response.status_code == 204
    
    # Verify region is deleted
    get_response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        headers=headers
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_region_sequence_auto_increment(async_client, mock_trip_payload, mock_user_id):
    """Test that region sequences auto-increment."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create regions without specifying sequence
    payload1 = {
        "name": "Region 1",
        "start_date": (datetime.now() + timedelta(days=10)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=12)).isoformat()
    }
    
    response1 = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=payload1,
        headers=headers
    )
    assert response1.json()["sequence"] == 1
    
    payload2 = {
        "name": "Region 2",
        "start_date": (datetime.now() + timedelta(days=13)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=15)).isoformat()
    }
    
    response2 = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=payload2,
        headers=headers
    )
    assert response2.json()["sequence"] == 2


@pytest.mark.asyncio
async def test_region_state_transitions(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test region state transitions."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create region (default state: green)
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=mock_region_payload,
        headers=headers
    )
    region_id = create_response.json()["id"]
    
    # Verify initial state
    get_response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        headers=headers
    )
    assert get_response.json()["state"] == "green"
    
    # Transition to red (disrupted)
    response = await async_client.patch(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        json={"state": "red"},
        headers=headers
    )
    assert response.json()["state"] == "red"
    
    # Transition to purple (completed)
    response = await async_client.patch(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        json={"state": "purple"},
        headers=headers
    )
    assert response.json()["state"] == "purple"


@pytest.mark.asyncio
async def test_delete_region_cascades_to_locations(async_client, mock_trip_payload, mock_region_payload, 
                                                    mock_location_payload, mock_user_id):
    """Test that deleting a region cascades to locations."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create region
    region_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=mock_region_payload,
        headers=headers
    )
    region_id = region_response.json()["id"]
    
    # Create location in region
    loc_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    assert loc_response.status_code == 201
    location_id = loc_response.json()["id"]
    
    # Delete region
    delete_response = await async_client.delete(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        headers=headers
    )
    assert delete_response.status_code == 204
    
    # Verify location is also deleted
    get_loc_response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected/{location_id}",
        headers=headers
    )
    assert get_loc_response.status_code == 404
