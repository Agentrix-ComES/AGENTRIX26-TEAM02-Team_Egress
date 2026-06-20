"""Booking Service — FastAPI application entrypoint.

Bounded context: "Confirmed transactions with providers." Owns transport
bookings, hotel search + bookings, and dining reservations. Bookings carry
``trip_id``/``region_node_id`` (Trip Service) and ``dining_option_id``
(Destination Service) as cross-service references.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import settings
from app.core.database import Base, engine

# Import models so they register on Base.metadata before create_all runs.
from app import models  # noqa: F401


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Agentrix Booking Service",
    description="Transactional bookings and reservations with providers.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health"])
async def health() -> dict:
    return {"status": "ok", "service": settings.SERVICE_NAME}
