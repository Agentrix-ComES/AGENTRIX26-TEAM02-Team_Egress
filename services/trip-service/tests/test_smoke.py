"""Smoke tests that exercise app wiring without requiring a database.

These verify imports, route registration and OpenAPI generation succeed,
which catches the majority of integration mistakes (bad deps, schema/model
mismatches, route typos) before a live PostgreSQL instance is involved.
"""
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
    assert body["service"] == "trip-service"


def test_openapi_generates():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "Agentrix Trip Service"


def test_expected_routes_registered():
    paths = client.get("/openapi.json").json()["paths"]
    assert "/api/v1/trips" in paths
    assert "/api/v1/trips/{trip_id}" in paths
    assert "/api/v1/trips/{trip_id}/timeline" in paths
    assert "/api/v1/trips/{trip_id}/timeline/regions" in paths
    assert "/api/v1/trips/{trip_id}/alerts" in paths
    assert "/api/v1/trips/{trip_id}/alerts/{alert_id}/propagate" in paths
