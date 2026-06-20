"""Smoke tests for the Destination Service (no database required)."""
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
    assert body["service"] == "destination-service"


def test_openapi_generates():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert response.json()["info"]["title"] == "Agentrix Destination Service"


def test_expected_routes_registered():
    paths = client.get("/openapi.json").json()["paths"]
    assert "/api/v1/regions" in paths
    assert "/api/v1/regions/{region_id}" in paths
    assert "/api/v1/regions/{region_id}/locations" in paths
    assert "/api/v1/regions/{region_id}/activities" in paths
    assert "/api/v1/regions/{region_id}/dining" in paths
    assert "/api/v1/regions/{region_id}/emergency" in paths
    assert "/api/v1/regions/{region_id}/offers" in paths
    assert "/api/v1/regions/{region_id}/culture" in paths
