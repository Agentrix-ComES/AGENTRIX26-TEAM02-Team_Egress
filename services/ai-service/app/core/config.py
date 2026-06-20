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

    # --- Content ingestion capacity caps (max points stored per category) ---
    ingest_max_hotels: int = Field(default=500)
    ingest_max_activities: int = Field(default=800)
    ingest_max_transport: int = Field(default=300)
    ingest_max_dining: int = Field(default=600)
    # Rule-based quality gates (rule-based, no AI involved).
    # POI must have at least this many OSM tags to be considered useful.
    ingest_min_tags: int = Field(default=3)

    # Qdrant
    qdrant_host: str = Field(default="qdrant")
    qdrant_port: int = Field(default=6333)
    qdrant_grpc_port: int = Field(default=6334)
    qdrant_prefer_grpc: bool = Field(default=True)
    qdrant_https: bool = Field(default=False)
    qdrant_collection_travel: str = Field(default="travel_items")
    qdrant_api_key: str | None = Field(default=None)
    # Optional namespace prefix applied to every collection (useful per-env).
    qdrant_collection_prefix: str = Field(default="")
    # Minimum cosine score a hit must reach to be returned (0 = no filter).
    qdrant_score_threshold: float = Field(default=0.0)
    # Default number of hits to pull per collection during retrieval.
    qdrant_top_k: int = Field(default=5)
    # --- Accuracy / index tuning ---
    # HNSW graph: higher m = better recall, more memory; ef_construct = build quality.
    qdrant_hnsw_m: int = Field(default=32)
    qdrant_hnsw_ef_construct: int = Field(default=256)
    # Query-time search breadth: higher = more accurate, slower. None = server default.
    qdrant_hnsw_ef_search: int = Field(default=128)
    # Over-fetch factor: pull k * factor candidates, then rerank down to k.
    qdrant_overfetch_factor: int = Field(default=4)
    # MMR diversity (0 = pure relevance, 1 = pure diversity) to reduce near-dupes.
    qdrant_mmr_lambda: float = Field(default=0.7)

    # Neo4j
    neo4j_uri: str = Field(default="bolt://neo4j:7687")
    neo4j_user: str = Field(default="neo4j")
    neo4j_password: str = Field(default="neo4jpassword")

    # LangSmith / LangChain
    langsmith_api_key: str | None = Field(default=None)
    langsmith_project: str = Field(default="travel-platform")
    langchain_tracing_v2: bool = Field(default=False)

    # LLM / providers (Google Gemini)
    gemini_api_key: str | None = Field(default=None)
    default_llm_model: str = Field(default="gemini-2.5-flash")
    default_temperature: float = Field(default=0.2)
    # gemini-embedding-001 supports configurable output dims (Matryoshka),
    # so embedding_dim can stay 1536 to match existing Qdrant collections.
    embedding_model: str = Field(default="gemini-embedding-001")
    embedding_dim: int = Field(default=1536)

    # LLM tiers — route each task to the right model.
    #   primary:   hard intelligence (planning, complex reasoning, replanning)
    #   secondary: medium tasks (conversation, disruption analysis)
    #   tertiary:  low/cheap tasks (intent classification, data extraction)
    primary_llm_model: str = Field(default="gemini-2.5-pro")
    primary_temperature: float = Field(default=0.3)
    secondary_llm_model: str = Field(default="gemini-2.5-flash")
    secondary_temperature: float = Field(default=0.4)
    tertiary_llm_model: str = Field(default="gemini-2.5-flash")
    tertiary_temperature: float = Field(default=0.0)

    # External APIs
    maps_api_key: str | None = Field(default=None)
    weather_api_key: str | None = Field(default=None)
    transport_api_key: str | None = Field(default=None)
    tourism_api_key: str | None = Field(default=None)
    # The Guardian Open Platform — free key at https://open-platform.theguardian.com/access/
    # Falls back to "test" key (anonymous, 1 req/s) when not set.
    guardian_api_key: str | None = Field(default=None)

    # --- Real-time data providers (free sources) ---
    # Open-Meteo: forecast + geocoding, no API key required.
    openmeteo_forecast_url: str = Field(default="https://api.open-meteo.com/v1/forecast")
    openmeteo_geocoding_url: str = Field(
        default="https://geocoding-api.open-meteo.com/v1/search"
    )
    # OSM Overpass: keyless POIs (hotels, activities, transport).
    # Primary endpoint + fallback mirrors (tried in order if one 4xx/5xx fails).
    overpass_url: str = Field(default="https://overpass-api.de/api/interpreter")
    overpass_mirrors: list[str] = Field(
        default=[
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
            "https://overpass.openstreetmap.ru/api/interpreter",
        ]
    )
    # OpenTripMap: attractions w/ ratings + descriptions (instant free key, optional).
    opentripmap_url: str = Field(default="https://api.opentripmap.com/0.1/en/places")
    opentripmap_api_key: str | None = Field(default=None)
    # OpenRouteService: routing/transfers (instant free key, optional).
    openrouteservice_url: str = Field(default="https://api.openrouteservice.org")
    openrouteservice_api_key: str | None = Field(default=None)

    # Sri Lanka bounding box (S, W, N, E) used for Overpass area queries.
    sl_bbox_south: float = Field(default=5.9)
    sl_bbox_west: float = Field(default=79.6)
    sl_bbox_north: float = Field(default=9.9)
    sl_bbox_east: float = Field(default=81.9)

    # HTTP client behaviour for provider calls.
    http_timeout_seconds: float = Field(default=30.0)
    http_max_retries: int = Field(default=3)
    http_user_agent: str = Field(
        default="TravelPlatformAI/0.1 (Sri Lanka trip planner; contact@travelplatform.lk)"
    )

    # Cache TTLs (seconds). Volatile data is cached short; content longer.
    cache_ttl_weather: int = Field(default=1800)       # 30 min
    cache_ttl_geocode: int = Field(default=2592000)    # 30 days
    cache_ttl_places: int = Field(default=86400)       # 1 day
    cache_ttl_routing: int = Field(default=86400)      # 1 day
    cache_ttl_news_alerts: int = Field(default=900)    # 15 min — news is time-sensitive
    cache_ttl_travel_advisory: int = Field(default=21600)  # 6 hours

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

    @property
    def redis_dsn(self) -> str:
        """redis:// URL for the async Redis cache client."""
        auth = f":{self.redis_password}@" if self.redis_password else ""
        return f"redis://{auth}{self.redis_host}:{self.redis_port}/0"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
