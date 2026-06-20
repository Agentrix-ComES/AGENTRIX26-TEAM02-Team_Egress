"""Trip Service — FastAPI application entrypoint.

Bounded context: "What is the user's plan." Owns trips, the regional timeline,
selected locations (references into the Destination catalog) and trip alerts.
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
    # Dev convenience: create tables on startup. Production uses migrations.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Agentrix Trip Service",
    description="Owns the user's trip plan: trips, timeline, selected locations and alerts.",
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
