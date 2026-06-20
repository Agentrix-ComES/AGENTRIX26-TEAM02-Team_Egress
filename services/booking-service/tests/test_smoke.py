"""Smoke tests for the Booking Service (no database required)."""
import os

os.environ.setdefault("AUTH_DISABLED", "true")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health_ok():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "booking-service"


def test_openapi_generates():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert response.json()["info"]["title"] == "Agentrix Booking Service"


def test_expected_routes_registered():
    paths = client.get("/openapi.json").json()["paths"]
    assert "/api/v1/transport-bookings" in paths
    assert "/api/v1/transport-bookings/{booking_id}" in paths
    assert "/api/v1/hotels/search" in paths
    assert "/api/v1/hotel-bookings" in paths
    assert "/api/v1/hotel-bookings/{booking_id}" in paths
    assert "/api/v1/dining-reservations" in paths
    assert "/api/v1/dining-reservations/{reservation_id}" in paths
