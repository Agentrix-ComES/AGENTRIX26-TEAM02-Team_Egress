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


async def create_region(async_client, trip_id, mock_region_payload, user_id):
    """Helper to create a region."""
    headers = {"X-User-ID": user_id}
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=mock_region_payload,
        headers=headers
    )
    assert response.status_code == 201
    return response.json()["id"]


@pytest.mark.asyncio
async def test_add_location_success(async_client, mock_trip_payload, mock_region_payload, 
                                    mock_location_payload, mock_user_id):
    """Test successfully adding a location to a region."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["location_id"] == "loc-001"
    assert data["location_name"] == "Sigiriya Rock"
    assert "visit_date" in data
    assert data["visit_time"] == "09:00"
    assert data["duration_scheduled"] == 180


@pytest.mark.asyncio
async def test_add_location_missing_required_field(async_client, mock_trip_payload, mock_region_payload, 
                                                    mock_location_payload, mock_user_id):
    """Test adding location fails with missing required field."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    payload = {**mock_location_payload}
    del payload["location_id"]  # Remove required field
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422  # Unprocessable Entity


@pytest.mark.asyncio
async def test_prevent_duplicate_location_in_region(async_client, mock_trip_payload, mock_region_payload, 
                                                     mock_location_payload, mock_user_id):
    """Test that duplicate locations in same region are rejected."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Add location first time
    response1 = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    assert response1.status_code == 201
    
    # Try to add same location again
    response2 = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    
    # Should return conflict error
    assert response2.status_code == 409  # Conflict


@pytest.mark.asyncio
async def test_get_location_success(async_client, mock_trip_payload, mock_region_payload, 
                                    mock_location_payload, mock_user_id):
    """Test retrieving a location by ID."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Add location
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    location_id = create_response.json()["id"]
    
    # Get location
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected/{location_id}",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == location_id
    assert data["location_name"] == "Sigiriya Rock"


@pytest.mark.asyncio
async def test_get_location_not_found(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test getting non-existent location returns 404."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected/nonexistent-location",
        headers=headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_locations_empty(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test listing locations when none exist."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data == [] or data.get("items") == []


@pytest.mark.asyncio
async def test_list_locations_multiple(async_client, mock_trip_payload, mock_region_payload, 
                                       mock_location_payload, mock_user_id):
    """Test listing multiple locations in a region."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Add first location
    loc1_payload = {**mock_location_payload, "location_id": "loc-001", "location_name": "Sigiriya"}
    await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=loc1_payload,
        headers=headers
    )
    
    # Add second location
    loc2_payload = {
        **mock_location_payload,
        "location_id": "loc-002",
        "location_name": "Dambulla Temple"
    }
    await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=loc2_payload,
        headers=headers
    )
    
    # List locations
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_update_location_visit_schedule(async_client, mock_trip_payload, mock_region_payload, 
                                              mock_location_payload, mock_user_id):
    """Test updating location visit schedule."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Add location
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    location_id = create_response.json()["id"]
    
    # Update location schedule
    update_payload = {
        "visit_time": "14:00",
        "duration_scheduled": 240  # 4 hours
    }
    response = await async_client.patch(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected/{location_id}",
        json=update_payload,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["visit_time"] == "14:00"
    assert data["duration_scheduled"] == 240


@pytest.mark.asyncio
async def test_delete_location_success(async_client, mock_trip_payload, mock_region_payload, 
                                       mock_location_payload, mock_user_id):
    """Test deleting a location."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Add location
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    location_id = create_response.json()["id"]
    
    # Delete location
    response = await async_client.delete(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected/{location_id}",
        headers=headers
    )
    
    assert response.status_code == 204
    
    # Verify location is deleted
    get_response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected/{location_id}",
        headers=headers
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_location_visit_date_within_region_bounds(async_client, mock_trip_payload, mock_region_payload, 
                                                         mock_location_payload, mock_user_id):
    """Test that visit date must be within region date bounds."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Try to add location with visit date outside region bounds
    payload = {**mock_location_payload}
    payload["visit_date"] = (datetime.now() + timedelta(days=25)).isoformat()  # After region ends
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=payload,
        headers=headers
    )
    
    # Should return validation error
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_location_same_location_id_different_regions_allowed(async_client, mock_trip_payload, 
                                                                    mock_region_payload, 
                                                                    mock_location_payload, mock_user_id):
    """Test that same location can be added to different regions."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create first region
    region1_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Create second region
    region2_payload = {
        **mock_region_payload,
        "name": "Kandy",
        "start_date": (datetime.now() + timedelta(days=13)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=15)).isoformat()
    }
    region2_id = await create_region(async_client, trip_id, region2_payload, mock_user_id)
    
    # Add same location to first region
    response1 = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region1_id}/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    assert response1.status_code == 201
    
    # Add same location to second region (should succeed)
    response2 = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region2_id}/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    assert response2.status_code == 201
