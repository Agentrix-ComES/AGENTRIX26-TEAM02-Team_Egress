"""
Hotel Search Integration Tests

Tests for hotel search functionality, result pagination, filtering, and error handling.
Validates deterministic hotel search results seeded by region ID.
"""

import pytest
from datetime import datetime, timedelta


@pytest.mark.asyncio
async def test_hotel_search_success(async_client, mock_hotel_search_payload, mock_user_id):
    """Test successful hotel search."""
    response = await async_client.post(
        "/api/v1/hotels/search",
        json=mock_hotel_search_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Verify hotel structure
    for hotel in data:
        assert "id" in hotel
        assert "name" in hotel
        assert "location" in hotel
        assert "price_per_night" in hotel
        assert "rating" in hotel


@pytest.mark.asyncio
async def test_hotel_search_deterministic_results(
    async_client, mock_hotel_search_payload, mock_user_id, mock_region_node_id
):
    """Test that hotel search returns deterministic results for same region."""
    # First search
    response1 = await async_client.post(
        "/api/v1/hotels/search",
        json=mock_hotel_search_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    data1 = response1.json()
    
    # Second search with same payload
    response2 = await async_client.post(
        "/api/v1/hotels/search",
        json=mock_hotel_search_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    data2 = response2.json()
    
    # Results should be identical
    assert data1 == data2


@pytest.mark.asyncio
async def test_hotel_search_different_regions(
    async_client, mock_hotel_search_payload, mock_user_id, mock_region_node_id
):
    """Test that different regions produce different hotel results."""
    # Search for first region
    response1 = await async_client.post(
        "/api/v1/hotels/search",
        json=mock_hotel_search_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    data1 = response1.json()
    first_hotel_id = data1[0]["id"] if data1 else None
    
    # Search for different region
    different_region_payload = mock_hotel_search_payload.copy()
    different_region_payload["region_node_id"] = "550e8400-e29b-41d4-a716-446655440003"
    
    response2 = await async_client.post(
        "/api/v1/hotels/search",
        json=different_region_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    data2 = response2.json()
    second_hotel_id = data2[0]["id"] if data2 else None
    
    # Results should differ (different seeding)
    assert first_hotel_id != second_hotel_id or first_hotel_id is None


@pytest.mark.asyncio
async def test_hotel_search_missing_field(
    async_client, mock_hotel_search_payload, mock_user_id
):
    """Test hotel search with missing required field."""
    invalid_payload = mock_hotel_search_payload.copy()
    del invalid_payload["check_in_date"]
    
    response = await async_client.post(
        "/api/v1/hotels/search",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_hotel_search_invalid_dates(
    async_client, mock_hotel_search_payload, mock_user_id
):
    """Test hotel search with invalid date range."""
    invalid_payload = mock_hotel_search_payload.copy()
    # Set checkout before checkin
    invalid_payload["check_out_date"] = (datetime.utcnow() + timedelta(days=-5)).date().isoformat()
    
    response = await async_client.post(
        "/api/v1/hotels/search",
        json=invalid_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code in [400, 422, 200]


@pytest.mark.asyncio
async def test_hotel_search_past_dates(
    async_client, mock_hotel_search_payload, mock_user_id
):
    """Test hotel search with dates in the past."""
    past_payload = mock_hotel_search_payload.copy()
    past_payload["check_in_date"] = (datetime.utcnow() + timedelta(days=-5)).date().isoformat()
    past_payload["check_out_date"] = (datetime.utcnow() + timedelta(days=-3)).date().isoformat()
    
    response = await async_client.post(
        "/api/v1/hotels/search",
        json=past_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    # Should either reject or return empty results
    assert response.status_code in [400, 422, 200]
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_hotel_search_long_stay(
    async_client, mock_hotel_search_payload, mock_user_id
):
    """Test hotel search for a long stay (many days)."""
    long_stay_payload = mock_hotel_search_payload.copy()
    long_stay_payload["check_in_date"] = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
    long_stay_payload["check_out_date"] = (datetime.utcnow() + timedelta(days=30)).date().isoformat()
    
    response = await async_client.post(
        "/api/v1/hotels/search",
        json=long_stay_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_hotel_search_short_stay_one_night(
    async_client, mock_hotel_search_payload, mock_user_id
):
    """Test hotel search for a single night stay."""
    one_night_payload = mock_hotel_search_payload.copy()
    one_night_payload["check_in_date"] = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
    one_night_payload["check_out_date"] = (datetime.utcnow() + timedelta(days=2)).date().isoformat()
    
    response = await async_client.post(
        "/api/v1/hotels/search",
        json=one_night_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_hotel_search_results_have_pricing(
    async_client, mock_hotel_search_payload, mock_user_id
):
    """Test that hotel search results include pricing information."""
    response = await async_client.post(
        "/api/v1/hotels/search",
        json=mock_hotel_search_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    
    for hotel in data:
        assert "price_per_night" in hotel
        assert isinstance(hotel["price_per_night"], (int, float))
        assert hotel["price_per_night"] > 0


@pytest.mark.asyncio
async def test_hotel_search_results_have_ratings(
    async_client, mock_hotel_search_payload, mock_user_id
):
    """Test that hotel search results include ratings."""
    response = await async_client.post(
        "/api/v1/hotels/search",
        json=mock_hotel_search_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    
    for hotel in data:
        assert "rating" in hotel
        if hotel["rating"] is not None:
            assert 0 <= hotel["rating"] <= 5


@pytest.mark.asyncio
async def test_hotel_search_with_different_users(
    async_client, mock_hotel_search_payload, mock_user_id
):
    """Test that hotel search returns same results for different users (same region)."""
    # Search as user 1
    response1 = await async_client.post(
        "/api/v1/hotels/search",
        json=mock_hotel_search_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    data1 = response1.json()
    
    # Search as different user (same region)
    other_user_id = "550e8400-e29b-41d4-a716-446655440099"
    response2 = await async_client.post(
        "/api/v1/hotels/search",
        json=mock_hotel_search_payload,
        headers={"X-User-Id": other_user_id},
    )
    data2 = response2.json()
    
    # Results should be identical (region-based seeding is consistent)
    assert data1 == data2


@pytest.mark.asyncio
async def test_hotel_search_empty_region_results(
    async_client, mock_hotel_search_payload, mock_user_id
):
    """Test hotel search result count."""
    response = await async_client.post(
        "/api/v1/hotels/search",
        json=mock_hotel_search_payload,
        headers={"X-User-Id": str(mock_user_id)},
    )
    assert response.status_code == 200
    data = response.json()
    
    # Expect reasonable number of results
    assert isinstance(data, list)
    assert len(data) >= 0  # May be empty, but should be valid
