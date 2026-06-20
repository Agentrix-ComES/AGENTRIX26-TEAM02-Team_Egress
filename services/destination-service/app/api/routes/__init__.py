"""Aggregates all Destination Service route modules."""
from fastapi import APIRouter

from app.api.routes import (
    activities,
    culture,
    dining,
    emergency,
    locations,
    offers,
    regions,
)

api_router = APIRouter()
api_router.include_router(regions.router)
api_router.include_router(locations.router)
api_router.include_router(activities.router)
api_router.include_router(dining.router)
api_router.include_router(emergency.router)
api_router.include_router(offers.router)
api_router.include_router(culture.router)
