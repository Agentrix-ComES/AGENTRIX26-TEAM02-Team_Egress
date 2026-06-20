"""AI Service FastAPI application entrypoint."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.core.langsmith import configure_langsmith
from app.db.neo4j import close_neo4j, verify_neo4j
from app.db.qdrant import close_qdrant, init_qdrant
from app.db.redis import close_redis, verify_redis
from app.db.session import close_db, init_db
from app.graph.checkpointer import close_checkpointer, init_checkpointer
from app.providers.base import close_http_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(settings.service_name)

TAGS_METADATA = [
    {"name": "chat", "description": "Plan, modify, and converse about trips in one endpoint."},
    {"name": "conversations", "description": "Read conversation history and the current itinerary."},
    {"name": "data", "description": "Real-time weather and OpenStreetMap content ingestion into Qdrant."},
    {"name": "llm-config", "description": "Manage LLM provider/model parameters."},
    {"name": "health", "description": "Service liveness checks."},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize external resources on startup and clean up on shutdown."""
    configure_langsmith()
    await init_db()
    await init_qdrant()
    await verify_neo4j()
    await verify_redis()
    await init_checkpointer()
    logger.info("%s startup complete", settings.service_name)
    try:
        yield
    finally:
        await close_checkpointer()
        await close_http_client()
        await close_redis()
        await close_neo4j()
        await close_qdrant()
        await close_db()
        logger.info("%s shutdown complete", settings.service_name)


app = FastAPI(
    title="AI Service",
    description=(
        "LangGraph orchestration, retrieval, and routing for the travel platform.\n\n"
        "The chat endpoint is the single entry point: a trip idea generates a "
        "location-based timeline (hotels, activities, transport) from the user's "
        "preferences, follow-up messages modify the plan, and disruptions trigger a replan.\n\n"
        "- **Swagger UI**: `/docs`\n"
        "- **ReDoc**: `/redoc`\n"
        "- **OpenAPI schema**: `/openapi.json`"
    ),
    version="0.1.0",
    lifespan=lifespan,
    openapi_tags=TAGS_METADATA,
    docs_url="/docs",
    redoc_url="/redoc",
    contact={"name": "Team Egress"},
)

app.include_router(api_router)


@app.get("/health", tags=["health"], summary="Liveness check")
@app.get(f"{settings.api_prefix}/health", tags=["health"], summary="Liveness check (gateway path)", include_in_schema=False)
async def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}
