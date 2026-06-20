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
    return response.json()["id"] if response.status_code == 201 else None


async def create_region(async_client, trip_id, region_payload, user_id):
    """Helper to create a region."""
    headers = {"X-User-ID": user_id}
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=region_payload,
        headers=headers
    )
    return response.json()["id"] if response.status_code == 201 else None


# ==================== TRIP ERROR CASES ====================

@pytest.mark.asyncio
async def test_trip_missing_title(async_client, mock_trip_payload, mock_user_id):
    """Test trip creation fails when title is missing."""
    headers = {"X-User-ID": mock_user_id}
    payload = {**mock_trip_payload}
    del payload["title"]
    
    response = await async_client.post(
        "/api/v1/trips",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_trip_missing_destination(async_client, mock_trip_payload, mock_user_id):
    """Test trip creation fails when destination is missing."""
    headers = {"X-User-ID": mock_user_id}
    payload = {**mock_trip_payload}
    del payload["destination"]
    
    response = await async_client.post(
        "/api/v1/trips",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_trip_missing_start_date(async_client, mock_trip_payload, mock_user_id):
    """Test trip creation fails when start_date is missing."""
    headers = {"X-User-ID": mock_user_id}
    payload = {**mock_trip_payload}
    del payload["start_date"]
    
    response = await async_client.post(
        "/api/v1/trips",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_trip_missing_end_date(async_client, mock_trip_payload, mock_user_id):
    """Test trip creation fails when end_date is missing."""
    headers = {"X-User-ID": mock_user_id}
    payload = {**mock_trip_payload}
    del payload["end_date"]
    
    response = await async_client.post(
        "/api/v1/trips",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_trip_negative_budget(async_client, mock_trip_payload, mock_user_id):
    """Test trip creation with negative budget is rejected."""
    headers = {"X-User-ID": mock_user_id}
    payload = {**mock_trip_payload, "budget": -1000}
    
    response = await async_client.post(
        "/api/v1/trips",
        json=payload,
        headers=headers
    )
    
    # Should validate and reject
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_trip_zero_budget_allowed(async_client, mock_trip_payload, mock_user_id):
    """Test trip creation with zero budget is allowed."""
    headers = {"X-User-ID": mock_user_id}
    payload = {**mock_trip_payload, "budget": 0}
    
    response = await async_client.post(
        "/api/v1/trips",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_trip_end_date_equals_start_date(async_client, mock_trip_payload, mock_user_id):
    """Test trip with end_date equal to start_date."""
    headers = {"X-User-ID": mock_user_id}
    payload = {**mock_trip_payload}
    same_date = (datetime.now() + timedelta(days=10)).isoformat()
    payload["start_date"] = same_date
    payload["end_date"] = same_date
    
    response = await async_client.post(
        "/api/v1/trips",
        json=payload,
        headers=headers
    )
    
    # Single-day trips should be allowed
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_trip_get_nonexistent_returns_404(async_client, mock_user_id):
    """Test getting non-existent trip returns 404."""
    headers = {"X-User-ID": mock_user_id}
    
    response = await async_client.get(
        "/api/v1/trips/invalid-trip-id-12345",
        headers=headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_trip_delete_nonexistent_returns_404(async_client, mock_user_id):
    """Test deleting non-existent trip returns 404."""
    headers = {"X-User-ID": mock_user_id}
    
    response = await async_client.delete(
        "/api/v1/trips/invalid-trip-id-12345",
        headers=headers
    )
    
    assert response.status_code == 404


# ==================== REGION ERROR CASES ====================

@pytest.mark.asyncio
async def test_region_missing_name(async_client, mock_trip_payload, mock_region_payload, mock_user_id):
    """Test region creation fails when name is missing."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    payload = {**mock_region_payload}
    del payload["name"]
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_region_on_nonexistent_trip_returns_404(async_client, mock_region_payload, mock_user_id):
    """Test region creation on non-existent trip returns 404."""
    headers = {"X-User-ID": mock_user_id}
    
    response = await async_client.post(
        "/api/v1/trips/invalid-trip-id/timeline/regions",
        json=mock_region_payload,
        headers=headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_region_get_nonexistent_returns_404(async_client, mock_trip_payload, mock_user_id):
    """Test getting non-existent region returns 404."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/invalid-region-id",
        headers=headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_region_delete_nonexistent_returns_404(async_client, mock_trip_payload, mock_user_id):
    """Test deleting non-existent region returns 404."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    response = await async_client.delete(
        f"/api/v1/trips/{trip_id}/timeline/regions/invalid-region-id",
        headers=headers
    )
    
    assert response.status_code == 404


# ==================== LOCATION ERROR CASES ====================

@pytest.mark.asyncio
async def test_location_missing_location_id(async_client, mock_trip_payload, mock_region_payload, 
                                            mock_location_payload, mock_user_id):
    """Test location creation fails when location_id is missing."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    payload = {**mock_location_payload}
    del payload["location_id"]
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_location_on_nonexistent_region_returns_404(async_client, mock_trip_payload, 
                                                           mock_location_payload, mock_user_id):
    """Test location creation on non-existent region returns 404."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions/invalid-region/locations/selected",
        json=mock_location_payload,
        headers=headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_location_get_nonexistent_returns_404(async_client, mock_trip_payload, 
                                                     mock_region_payload, mock_user_id):
    """Test getting non-existent location returns 404."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}/locations/selected/invalid-location",
        headers=headers
    )
    
    assert response.status_code == 404


# ==================== ALERT ERROR CASES ====================

@pytest.mark.asyncio
async def test_alert_missing_type(async_client, mock_trip_payload, mock_region_payload, 
                                  mock_alert_payload, mock_user_id):
    """Test alert creation fails when type is missing."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    payload = {**mock_alert_payload, "affected_region_id": region_id}
    del payload["type"]
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_alert_missing_severity(async_client, mock_trip_payload, mock_region_payload, 
                                      mock_alert_payload, mock_user_id):
    """Test alert creation fails when severity is missing."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    payload = {**mock_alert_payload, "affected_region_id": region_id}
    del payload["severity"]
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_alert_on_nonexistent_region(async_client, mock_trip_payload, 
                                          mock_alert_payload, mock_user_id):
    """Test alert creation on non-existent region fails."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    payload = {**mock_alert_payload, "affected_region_id": "nonexistent-region"}
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=payload,
        headers=headers
    )
    
    # Should fail because region doesn't exist
    assert response.status_code in [400, 404]


@pytest.mark.asyncio
async def test_alert_get_nonexistent_returns_404(async_client, mock_trip_payload, mock_user_id):
    """Test getting non-existent alert returns 404."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/alerts/invalid-alert-id",
        headers=headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_alert_update_nonexistent_returns_404(async_client, mock_trip_payload, mock_user_id):
    """Test updating non-existent alert returns 404."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    response = await async_client.patch(
        f"/api/v1/trips/{trip_id}/alerts/invalid-alert-id/status",
        json={"status": "resolved"},
        headers=headers
    )
    
    assert response.status_code == 404


# ==================== AUTHORIZATION TESTS ====================

@pytest.mark.asyncio
async def test_missing_user_id_header(async_client, mock_trip_payload):
    """Test request without user ID header is rejected or handled."""
    # Some implementations require X-User-ID, others have defaults
    response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload
    )
    
    # Should either require auth or have default behavior
    assert response.status_code in [400, 403, 500, 201]  # Depends on implementation


@pytest.mark.asyncio
async def test_user_cannot_access_other_users_region(async_client, mock_trip_payload, mock_region_payload):
    """Test user A cannot access user B's region."""
    user_a = "user-a-123"
    user_b = "user-b-456"
    
    headers_a = {"X-User-ID": user_a}
    headers_b = {"X-User-ID": user_b}
    
    # User A creates trip and region
    trip_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers_a
    )
    trip_id = trip_response.json()["id"]
    
    region_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=mock_region_payload,
        headers=headers_a
    )
    region_id = region_response.json()["id"]
    
    # User B tries to access region
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/timeline/regions/{region_id}",
        headers=headers_b
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_user_cannot_access_other_users_alert(async_client, mock_trip_payload, mock_region_payload, 
                                                     mock_alert_payload):
    """Test user A cannot access user B's alert."""
    user_a = "user-a-123"
    user_b = "user-b-456"
    
    headers_a = {"X-User-ID": user_a}
    headers_b = {"X-User-ID": user_b}
    
    # User A creates trip, region, and alert
    trip_response = await async_client.post(
        "/api/v1/trips",
        json=mock_trip_payload,
        headers=headers_a
    )
    trip_id = trip_response.json()["id"]
    
    region_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=mock_region_payload,
        headers=headers_a
    )
    region_id = region_response.json()["id"]
    
    alert_payload = {**mock_alert_payload, "affected_region_id": region_id}
    alert_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=alert_payload,
        headers=headers_a
    )
    alert_id = alert_response.json()["id"]
    
    # User B tries to access alert
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/alerts/{alert_id}",
        headers=headers_b
    )
    
    assert response.status_code == 404
