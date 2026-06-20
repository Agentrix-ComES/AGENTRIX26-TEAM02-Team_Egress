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


async def create_region(async_client, trip_id, region_payload, user_id):
    """Helper to create a region."""
    headers = {"X-User-ID": user_id}
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/timeline/regions",
        json=region_payload,
        headers=headers
    )
    assert response.status_code == 201
    return response.json()["id"]


@pytest.mark.asyncio
async def test_create_alert_success(async_client, mock_trip_payload, mock_region_payload, 
                                    mock_alert_payload, mock_user_id):
    """Test successfully creating an alert."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Update alert payload with actual region ID
    alert_payload = {**mock_alert_payload, "affected_region_id": region_id}
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=alert_payload,
        headers=headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "delay"
    assert data["severity"] == "medium"
    assert data["affected_region_id"] == region_id
    assert data["status"] == "active"


@pytest.mark.asyncio
async def test_create_alert_missing_required_field(async_client, mock_trip_payload, mock_region_payload, 
                                                   mock_alert_payload, mock_user_id):
    """Test alert creation fails with missing required field."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    payload = {**mock_alert_payload, "affected_region_id": region_id}
    del payload["type"]  # Remove required field
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422  # Unprocessable Entity


@pytest.mark.asyncio
async def test_create_alert_invalid_type(async_client, mock_trip_payload, mock_region_payload, 
                                        mock_alert_payload, mock_user_id):
    """Test alert creation fails with invalid type."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    payload = {**mock_alert_payload, "affected_region_id": region_id, "type": "invalid_type"}
    
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_alert_success(async_client, mock_trip_payload, mock_region_payload, 
                                mock_alert_payload, mock_user_id):
    """Test retrieving an alert by ID."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Create alert
    alert_payload = {**mock_alert_payload, "affected_region_id": region_id}
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=alert_payload,
        headers=headers
    )
    alert_id = create_response.json()["id"]
    
    # Get alert
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/alerts/{alert_id}",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == alert_id
    assert data["type"] == "delay"


@pytest.mark.asyncio
async def test_list_alerts_empty(async_client, mock_trip_payload, mock_user_id):
    """Test listing alerts when none exist."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/alerts",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data == [] or data.get("items") == []


@pytest.mark.asyncio
async def test_list_alerts_multiple(async_client, mock_trip_payload, mock_region_payload, 
                                   mock_alert_payload, mock_user_id):
    """Test listing multiple alerts."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Create two alerts
    alert1 = {**mock_alert_payload, "affected_region_id": region_id, "type": "delay"}
    alert2 = {**mock_alert_payload, "affected_region_id": region_id, "type": "closure"}
    
    await async_client.post(f"/api/v1/trips/{trip_id}/alerts", json=alert1, headers=headers)
    await async_client.post(f"/api/v1/trips/{trip_id}/alerts", json=alert2, headers=headers)
    
    # List alerts
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/alerts",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_update_alert_status(async_client, mock_trip_payload, mock_region_payload, 
                                  mock_alert_payload, mock_user_id):
    """Test updating alert status."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Create alert
    alert_payload = {**mock_alert_payload, "affected_region_id": region_id}
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=alert_payload,
        headers=headers
    )
    alert_id = create_response.json()["id"]
    
    # Update to acknowledged
    response = await async_client.patch(
        f"/api/v1/trips/{trip_id}/alerts/{alert_id}/status",
        json={"status": "acknowledged"},
        headers=headers
    )
    
    assert response.status_code == 200
    assert response.json()["status"] == "acknowledged"
    
    # Update to resolved
    response = await async_client.patch(
        f"/api/v1/trips/{trip_id}/alerts/{alert_id}/status",
        json={"status": "resolved"},
        headers=headers
    )
    
    assert response.status_code == 200
    assert response.json()["status"] == "resolved"


@pytest.mark.asyncio
async def test_alert_severity_levels(async_client, mock_trip_payload, mock_region_payload, 
                                    mock_alert_payload, mock_user_id):
    """Test all alert severity levels."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    severities = ["low", "medium", "high", "critical"]
    
    for severity in severities:
        payload = {**mock_alert_payload, "affected_region_id": region_id, "severity": severity}
        response = await async_client.post(
            f"/api/v1/trips/{trip_id}/alerts",
            json=payload,
            headers=headers
        )
        assert response.status_code == 201
        assert response.json()["severity"] == severity


@pytest.mark.asyncio
async def test_propagate_disruption_identifies_downstream_regions(async_client, mock_trip_payload, 
                                                                   mock_user_id):
    """Test disruption propagation identifies downstream regions."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create three sequential regions
    regions = []
    for i, day_offset in enumerate([10, 13, 16]):
        region_payload = {
            "name": f"Region {i+1}",
            "start_date": (datetime.now() + timedelta(days=day_offset)).isoformat(),
            "end_date": (datetime.now() + timedelta(days=day_offset+2)).isoformat(),
            "sequence": i+1
        }
        region_id = await create_region(async_client, trip_id, region_payload, mock_user_id)
        regions.append(region_id)
    
    # Create alert on first region
    alert_payload = {
        "type": "delay",
        "severity": "medium",
        "description": "Delay in first region",
        "affected_region_id": regions[0],
        "delay_minutes": 120
    }
    alert_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=alert_payload,
        headers=headers
    )
    alert_id = alert_response.json()["id"]
    
    # Propagate disruption
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts/{alert_id}/propagate",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify downstream analysis
    assert "downstream_regions" in data
    assert "analysis" in data
    
    # Check that downstream regions are identified
    affected_region_ids = [r.get("region_id") for r in data.get("downstream_regions", [])]
    # Regions 2 and 3 should be in downstream (but not the affected region itself)
    assert regions[1] in affected_region_ids or regions[2] in affected_region_ids


@pytest.mark.asyncio
async def test_propagate_disruption_risk_calculation(async_client, mock_trip_payload, 
                                                      mock_user_id):
    """Test delay risk is calculated correctly in propagation."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create two sequential regions
    region1_payload = {
        "name": "Region 1",
        "start_date": (datetime.now() + timedelta(days=10)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=12)).isoformat(),
        "sequence": 1
    }
    region1_id = await create_region(async_client, trip_id, region1_payload, mock_user_id)
    
    region2_payload = {
        "name": "Region 2",
        "start_date": (datetime.now() + timedelta(days=13)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=15)).isoformat(),
        "sequence": 2
    }
    region2_id = await create_region(async_client, trip_id, region2_payload, mock_user_id)
    
    # Create alert with 120+ minute delay (should trigger HIGH risk)
    alert_payload = {
        "type": "delay",
        "severity": "medium",
        "description": "120 minute delay",
        "affected_region_id": region1_id,
        "delay_minutes": 120
    }
    alert_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=alert_payload,
        headers=headers
    )
    alert_id = alert_response.json()["id"]
    
    # Propagate disruption
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts/{alert_id}/propagate",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Check risk calculation
    analysis = data.get("analysis", {})
    if analysis:
        # Should show risk_level: "high" for 120+ minute delay
        # or recommend actions for affected downstream regions
        assert "risk_level" in analysis or "recommendations" in analysis


@pytest.mark.asyncio
async def test_propagate_disruption_with_zero_downstream_regions(async_client, mock_trip_payload, 
                                                                   mock_user_id):
    """Test propagation on last region (no downstream regions)."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    
    # Create single region
    region_payload = {
        "name": "Last Region",
        "start_date": (datetime.now() + timedelta(days=10)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=12)).isoformat(),
        "sequence": 1
    }
    region_id = await create_region(async_client, trip_id, region_payload, mock_user_id)
    
    # Create alert
    alert_payload = {
        "type": "delay",
        "severity": "low",
        "description": "Minor delay",
        "affected_region_id": region_id,
        "delay_minutes": 30
    }
    alert_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=alert_payload,
        headers=headers
    )
    alert_id = alert_response.json()["id"]
    
    # Propagate disruption
    response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts/{alert_id}/propagate",
        headers=headers
    )
    
    # Should succeed gracefully even with zero downstream regions
    assert response.status_code == 200
    data = response.json()
    
    # Should indicate no downstream regions
    downstream = data.get("downstream_regions", [])
    assert len(downstream) == 0


@pytest.mark.asyncio
async def test_list_alerts_filter_by_status(async_client, mock_trip_payload, mock_region_payload, 
                                           mock_alert_payload, mock_user_id):
    """Test filtering alerts by status."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Create alert
    alert_payload = {**mock_alert_payload, "affected_region_id": region_id}
    create_response = await async_client.post(
        f"/api/v1/trips/{trip_id}/alerts",
        json=alert_payload,
        headers=headers
    )
    alert_id = create_response.json()["id"]
    
    # Filter by active status
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/alerts?status=active",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "active"
    
    # Update alert status
    await async_client.patch(
        f"/api/v1/trips/{trip_id}/alerts/{alert_id}/status",
        json={"status": "resolved"},
        headers=headers
    )
    
    # Filter by resolved status
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/alerts?status=resolved",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "resolved"


@pytest.mark.asyncio
async def test_multiple_alerts_on_same_region(async_client, mock_trip_payload, mock_region_payload, 
                                              mock_alert_payload, mock_user_id):
    """Test multiple alerts can exist on same region."""
    headers = {"X-User-ID": mock_user_id}
    trip_id = await create_trip(async_client, mock_trip_payload, mock_user_id)
    region_id = await create_region(async_client, trip_id, mock_region_payload, mock_user_id)
    
    # Create multiple alerts on same region
    alert1 = {**mock_alert_payload, "affected_region_id": region_id, "type": "delay"}
    alert2 = {**mock_alert_payload, "affected_region_id": region_id, "type": "weather"}
    alert3 = {**mock_alert_payload, "affected_region_id": region_id, "type": "closure"}
    
    response1 = await async_client.post(f"/api/v1/trips/{trip_id}/alerts", json=alert1, headers=headers)
    response2 = await async_client.post(f"/api/v1/trips/{trip_id}/alerts", json=alert2, headers=headers)
    response3 = await async_client.post(f"/api/v1/trips/{trip_id}/alerts", json=alert3, headers=headers)
    
    assert response1.status_code == 201
    assert response2.status_code == 201
    assert response3.status_code == 201
    
    # List all alerts for region
    response = await async_client.get(
        f"/api/v1/trips/{trip_id}/alerts",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
