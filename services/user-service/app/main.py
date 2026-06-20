import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import update, func

from app.core.config import settings
from app.db.session import AsyncSessionLocal, close_db, init_db
from app.models.user import User
from app.api.routes import users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(settings.service_name)


async def reconcile_admin_roles() -> None:
    """Apply the ADMIN_EMAILS env allowlist to existing user rows.

    Emails in the allowlist are promoted to Admin; anyone else previously marked
    Admin is demoted back to User so the env stays the single source of truth.
    """
    admin_emails = settings.admin_email_set
    async with AsyncSessionLocal() as session:
        if admin_emails:
            await session.execute(
                update(User)
                .where(func.lower(User.email).in_(admin_emails))
                .values(role="Admin")
            )
            await session.execute(
                update(User)
                .where(~func.lower(User.email).in_(admin_emails))
                .where(User.role == "Admin")
                .values(role="User")
            )
        else:
            await session.execute(
                update(User).where(User.role == "Admin").values(role="User")
            )
        await session.commit()
    logger.info("Admin reconciliation complete (%d allowlisted)", len(admin_emails))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize resources on startup and clean up on shutdown."""
    await init_db()
    await reconcile_admin_roles()
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
