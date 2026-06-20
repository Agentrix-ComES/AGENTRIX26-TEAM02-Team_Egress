"""Application settings loaded from environment variables."""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # App
    app_env: str = Field(default="development")
    service_name: str = Field(default="ai-service")
    api_prefix: str = Field(default="/ai")

    # PostgreSQL (pgvector)
    postgres_host: str = Field(default="postgres")
    postgres_port: int = Field(default=5432)
    postgres_db: str = Field(default="travel_platform")
    postgres_user: str = Field(default="postgres")
    postgres_password: str = Field(default="postgres")
    postgres_schema: str = Field(default="ai_domain")

    # Redis
    redis_host: str = Field(default="redis")
    redis_port: int = Field(default=6379)
    redis_password: str | None = Field(default=None)

    # Qdrant
    qdrant_host: str = Field(default="qdrant")
    qdrant_port: int = Field(default=6333)
    qdrant_grpc_port: int = Field(default=6334)
    qdrant_prefer_grpc: bool = Field(default=True)
    qdrant_https: bool = Field(default=False)
    qdrant_collection_travel: str = Field(default="travel_items")
    qdrant_api_key: str | None = Field(default=None)

    # Neo4j
    neo4j_uri: str = Field(default="bolt://neo4j:7687")
    neo4j_user: str = Field(default="neo4j")
    neo4j_password: str = Field(default="neo4jpassword")

    # LangSmith / LangChain
    langsmith_api_key: str | None = Field(default=None)
    langsmith_project: str = Field(default="travel-platform")
    langchain_tracing_v2: bool = Field(default=False)

    # LLM / providers
    openai_api_key: str | None = Field(default=None)
    default_llm_model: str = Field(default="gpt-4o-mini")
    default_temperature: float = Field(default=0.2)
    embedding_model: str = Field(default="text-embedding-3-small")
    embedding_dim: int = Field(default=1536)

    # LLM tiers — route each task to the right model.
    #   primary:   hard intelligence (planning, complex reasoning, replanning)
    #   secondary: medium tasks (conversation, disruption analysis)
    #   tertiary:  low/cheap tasks (intent classification, data extraction)
    primary_llm_model: str = Field(default="gpt-4o")
    primary_temperature: float = Field(default=0.3)
    secondary_llm_model: str = Field(default="gpt-4o-mini")
    secondary_temperature: float = Field(default=0.4)
    tertiary_llm_model: str = Field(default="gpt-4o-mini")
    tertiary_temperature: float = Field(default=0.0)

    # External APIs
    maps_api_key: str | None = Field(default=None)
    weather_api_key: str | None = Field(default=None)
    transport_api_key: str | None = Field(default=None)
    tourism_api_key: str | None = Field(default=None)

    @property
    def postgres_dsn(self) -> str:
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def postgres_psycopg_dsn(self) -> str:
        """Plain libpq DSN used by the LangGraph Postgres checkpointer (psycopg)."""
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
