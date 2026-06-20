"""Aggregates all route modules into a single API router."""
from fastapi import APIRouter

from app.api.routes import alerts, locations, timeline, trips

api_router = APIRouter()
api_router.include_router(trips.router)
api_router.include_router(timeline.router)
api_router.include_router(locations.router)
api_router.include_router(alerts.router)
