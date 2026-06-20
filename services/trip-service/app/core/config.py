"""Application configuration via environment variables (Pydantic settings)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Service identity
    SERVICE_NAME: str = "trip-service"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/trip_service"
    )
    DB_ECHO: bool = False

    # Auth (Supabase JWT)
    SUPABASE_JWT_SECRET: str = "super-secret-dev-jwt-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_AUDIENCE: str = "authenticated"
    # When true, auth is bypassed and a deterministic dev user is injected.
    AUTH_DISABLED: bool = True

    # CORS
    CORS_ORIGINS: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
