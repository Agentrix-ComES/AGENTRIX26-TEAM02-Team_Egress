import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.db.session import close_db, init_db
from app.api.routes import users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(settings.service_name)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize resources on startup and clean up on shutdown."""
    await init_db()
    logger.info("%s startup complete", settings.service_name)
    try:
        yield
    finally:
        await close_db()
        logger.info("%s shutdown complete", settings.service_name)

app = FastAPI(
    title="User Service",
    description="Microservice for user management and authentication.",
    version="0.1.0",
    lifespan=lifespan,
)

# Important: because Kong sends `/api/users/sync` directly to us 
# (strip_path: false means the path is retained), we must match the Kong route prefix.
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}
