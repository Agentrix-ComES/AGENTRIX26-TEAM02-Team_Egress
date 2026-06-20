"""Aggregates all Booking Service route modules."""
from fastapi import APIRouter

from app.api.routes import dining, hotels, transport

api_router = APIRouter()
api_router.include_router(transport.router)
api_router.include_router(hotels.router)
api_router.include_router(dining.router)
