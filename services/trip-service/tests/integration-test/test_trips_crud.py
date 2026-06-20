import pytest
from datetime import datetime, timedelta


@pytest.mark.asyncio
async def test_create_trip_success(async_client, mock_trip_payload, mock_user_id):
    """Test successful trip creation."""
    headers = {"X-User-ID": mock_user_id}
    
    response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Sri Lanka Adventure"
    assert data["destination"] == "Colombo, Sri Lanka"
    assert data["budget"] == 5000.0
    assert data["currency"] == "USD"
    assert data["status"] == "planning"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_trip_missing_required_field(async_client, mock_trip_payload, mock_user_id):
    """Test trip creation fails with missing required field."""
    headers = {"X-User-ID": mock_user_id}
    payload = {**mock_trip_payload}
    del payload["title"]  # Remove required field
    
    response = await async_client.post(
        "/api/v1/trips",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422  # Unprocessable Entity


@pytest.mark.asyncio
async def test_create_trip_invalid_dates(async_client, mock_trip_payload, mock_user_id):
    """Test trip creation fails when end_date is before start_date."""
    headers = {"X-User-ID": mock_user_id}
    payload = {**mock_trip_payload}
    payload["end_date"] = (datetime.now() + timedelta(days=5)).isoformat()
    payload["start_date"] = (datetime.now() + timedelta(days=10)).isoformat()
    
    response = await async_client.post(
        "/api/v1/trips",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_get_trip_success(async_client, mock_trip_payload, mock_user_id):
    """Test retrieving a trip by ID."""
    headers = {"X-User-ID": mock_user_id}
    
    # Create trip
    create_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers
    )
    trip_id = create_response.json()["id"]
    
    # Get trip
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == trip_id
    assert data["title"] == "Sri Lanka Adventure"


@pytest.mark.asyncio
async def test_get_trip_not_found(async_client, mock_user_id):
    """Test getting non-existent trip returns 404."""
    headers = {"X-User-ID": mock_user_id}
    
    response = await async_client.get(
        "/api/v1/trips/nonexistent-trip-id",
        headers=headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_trips_empty(async_client, mock_user_id):
    """Test listing trips when no trips exist."""
    headers = {"X-User-ID": mock_user_id}
    
    response = await async_client.get(
        "/api/v1/trips",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_list_trips_multiple(async_client, mock_trip_payload, mock_user_id):
    """Test listing multiple trips."""
    headers = {"X-User-ID": mock_user_id}
    
    # Create two trips
    trip1 = {**mock_trip_payload, "title": "Trip 1"}
    trip2 = {**mock_trip_payload, "title": "Trip 2"}
    
    await async_client.post("/api/v1/trips", json=trip1, headers=headers)
    await async_client.post("/api/v1/trips", json=trip2, headers=headers)
    
    # List trips
    response = await async_client.get(
        "/api/v1/trips",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_list_trips_filter_by_status(async_client, mock_trip_payload, mock_user_id):
    """Test filtering trips by status."""
    headers = {"X-User-ID": mock_user_id}
    
    # Create trip
    create_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers
    )
    
    # Filter by planning status
    response = await async_client.get(
        "/api/v1/trips?status=planning",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["status"] == "planning"


@pytest.mark.asyncio
async def test_update_trip_success(async_client, mock_trip_payload, mock_user_id):
    """Test updating a trip."""
    headers = {"X-User-ID": mock_user_id}
    
    # Create trip
    create_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers
    )
    trip_id = create_response.json()["id"]
    
    # Update trip
    update_payload = {"title": "Updated Sri Lanka Trip"}
    response = await async_client.patch(
        f"/api/v1/trips/{trip_id}",
        json=update_payload,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Sri Lanka Trip"


@pytest.mark.asyncio
async def test_update_trip_immutable_fields(async_client, mock_trip_payload, mock_user_id):
    """Test that immutable fields cannot be changed on update."""
    headers = {"X-User-ID": mock_user_id}
    
    # Create trip
    create_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers
    )
    original_id = create_response.json()["id"]
    original_user_id = create_response.json()["user_id"]
    
    # Try to update immutable field
    update_payload = {"id": "different-id", "user_id": "different-user"}
    response = await async_client.patch(
        f"/api/v1/trips/{original_id}",
        json=update_payload,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    # Verify immutable fields were not changed
    assert data["id"] == original_id
    assert data["user_id"] == original_user_id


@pytest.mark.asyncio
async def test_delete_trip_success(async_client, mock_trip_payload, mock_user_id):
    """Test deleting a trip."""
    headers = {"X-User-ID": mock_user_id}
    
    # Create trip
    create_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers
    )
    trip_id = create_response.json()["id"]
    
    # Delete trip
    response = await async_client.delete(
        f"/api/v1/trips/{trip_id}",
        headers=headers
    )
    
    assert response.status_code == 204
    
    # Verify trip is deleted
    get_response = await async_client.get(
        f"/api/v1/trips/{trip_id}",
        headers=headers
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_trip_cascades_to_regions(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test that deleting a trip cascades to regions."""
    headers = {"X-User-ID": mock_user_id}
    
    # Create trip
    create_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers
    )
    trip_id = create_response.json()["id"]
    
    # Create region
    region_payload = {**mock_region_payload, "trip_id": trip_id}
    region_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=region_payload,
        headers=headers
    )
    assert region_response.status_code == 201
    region_id = region_response.json()["id"]
    
    # Delete trip
    await async_client.delete(f"/api/v1/trips/{trip_id}", headers=headers)
    
    # Verify region is also deleted
    get_region_response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        headers=headers
    )
    # Should fail because trip is deleted
    assert get_region_response.status_code in [404, 400]


@pytest.mark.asyncio
async def test_user_isolation_cannot_access_other_users_trip(async_client, mock_trip_payload):
    """Test that user A cannot access user B's trip."""
    user_a = "user-a-123"
    user_b = "user-b-456"
    
    headers_a = {"X-User-ID": user_a}
    headers_b = {"X-User-ID": user_b}
    
    # User A creates trip
    create_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers_a
    )
    trip_id = create_response.json()["id"]
    
    # User B tries to access trip
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}",
        headers=headers_b
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_user_isolation_cannot_modify_other_users_trip(async_client, mock_trip_payload):
    """Test that user A cannot modify user B's trip."""
    user_a = "user-a-123"
    user_b = "user-b-456"
    
    headers_a = {"X-User-ID": user_a}
    headers_b = {"X-User-ID": user_b}
    
    # User A creates trip
    create_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers_a
    )
    trip_id = create_response.json()["id"]
    
    # User B tries to update trip
    response = await async_client.patch(
        f"/api/v1/trips/{trip_id}",
        json={"title": "Hacked Title"},
        headers=headers_b
    )
    
    assert response.status_code == 404
