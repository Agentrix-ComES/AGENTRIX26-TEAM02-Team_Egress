# Travel Platform Project Structure

This project uses **FastAPI + LangGraph + LangSmith + Supabase Auth + PostgreSQL + Qdrant + Neo4j + Redis** with a reduced microservice split: **User Service**, **Trip Service**, and **AI Service**, fronted by an API Gateway. Supabase Auth is suitable here because it issues JWTs and supports backend verification patterns for downstream services.[cite:168][cite:169] Redis fits as a supporting infrastructure component for caching, queues, and rate limiting rather than as the primary source of truth.[cite:153][cite:159]

## Architecture summary

The service layout is:

- **API Gateway**: request routing, auth forwarding, rate limiting, and edge concerns.
- **User Service**: user profile, support, notifications, admin-side user operations.
- **Trip Service**: trips, itineraries, bookings, trip lifecycle.
- **AI Service**: LangGraph orchestration, agent workflows, Qdrant retrieval, Neo4j traversal, LangSmith tracing.[cite:111][cite:113][cite:69]
- **Shared infrastructure**: PostgreSQL, Redis, Qdrant, Neo4j, Supabase Auth.

## Recommended repository shape

A single repository with clear service boundaries is the best fit for this MVP because the product is still one platform, while service ownership remains explicit.[cite:101][cite:102]

```text
travel-platform/
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Makefile
├── docs/
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── microservice-diagram.md
│   │   ├── er-diagram.md
│   │   └── deployment.md
│   ├── api/
│   │   ├── gateway.md
│   │   ├── user-service.md
│   │   ├── trip-service.md
│   │   └── ai-service.md
│   └── product/
│       ├── requirements.md
│       └── roadmap.md
├── infra/
│   ├── gateway/
│   │   ├── nginx.conf
│   │   └── routes/
│   ├── docker/
│   │   ├── user-service.Dockerfile
│   │   ├── trip-service.Dockerfile
│   │   ├── ai-service.Dockerfile
│   │   └── worker.Dockerfile
│   ├── scripts/
│   │   ├── init-postgres.sql
│   │   ├── create-neo4j-indexes.cypher
│   │   ├── create-qdrant-collections.py
│   │   └── seed-dev-data.py
│   └── monitoring/
│       ├── prometheus.yml
│       ├── grafana/
│       └── loki/
├── libs/
│   ├── common/
│   │   ├── config.py
│   │   ├── logging.py
│   │   ├── security.py
│   │   ├── exceptions.py
│   │   └── middleware.py
│   ├── db/
│   │   ├── postgres.py
│   │   ├── redis.py
│   │   ├── qdrant.py
│   │   └── neo4j.py
│   ├── auth/
│   │   ├── supabase_jwt.py
│   │   ├── current_user.py
│   │   └── roles.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── trip.py
│   │   ├── booking.py
│   │   ├── support.py
│   │   └── ai.py
│   └── events/
│       ├── topics.py
│       ├── producers.py
│       └── consumers.py
├── services/
│   ├── user-service/
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── api/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── users.py
│   │   │   │   │   ├── profiles.py
│   │   │   │   │   ├── support.py
│   │   │   │   │   ├── notifications.py
│   │   │   │   │   └── admin_users.py
│   │   │   │   └── deps.py
│   │   │   ├── core/
│   │   │   │   ├── config.py
│   │   │   │   └── security.py
│   │   │   ├── models/
│   │   │   │   ├── user.py
│   │   │   │   ├── support_ticket.py
│   │   │   │   └── notification.py
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   │   ├── user_service.py
│   │   │   │   ├── support_service.py
│   │   │   │   └── notification_service.py
│   │   │   ├── repositories/
│   │   │   └── workers/
│   │   ├── tests/
│   │   └── Dockerfile
│   ├── trip-service/
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── api/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── trips.py
│   │   │   │   │   ├── itineraries.py
│   │   │   │   │   ├── bookings.py
│   │   │   │   │   └── trip_alerts.py
│   │   │   │   └── deps.py
│   │   │   ├── models/
│   │   │   │   ├── trip.py
│   │   │   │   ├── itinerary.py
│   │   │   │   ├── booking.py
│   │   │   │   └── trip_alert.py
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   │   ├── trip_service.py
│   │   │   │   ├── itinerary_service.py
│   │   │   │   └── booking_service.py
│   │   │   ├── repositories/
│   │   │   └── workers/
│   │   ├── tests/
│   │   └── Dockerfile
│   └── ai-service/
│       ├── app/
│       │   ├── main.py
│       │   ├── api/
│       │   │   ├── routes/
│       │   │   │   ├── ai_chat.py
│       │   │   │   ├── trip_planning.py
│       │   │   │   ├── disruptions.py
│       │   │   │   ├── llm_config.py
│       │   │   │   └── retrieval.py
│       │   │   └── deps.py
│       │   ├── core/
│       │   │   ├── config.py
│       │   │   ├── langsmith.py
│       │   │   └── prompts.py
│       │   ├── graph/
│       │   │   ├── state.py
│       │   │   ├── builder.py
│       │   │   ├── nodes/
│       │   │   │   ├── planner.py
│       │   │   │   ├── logistics.py
│       │   │   │   ├── disruption.py
│       │   │   │   └── culture.py
│       │   │   ├── tools/
│       │   │   │   ├── qdrant_search.py
│       │   │   │   ├── neo4j_routes.py
│       │   │   │   ├── weather_api.py
│       │   │   │   ├── maps_api.py
│       │   │   │   ├── transport_api.py
│       │   │   │   └── tourism_api.py
│       │   │   └── checkpoints/
│       │   ├── models/
│       │   │   ├── llm_config.py
│       │   │   ├── agent_run.py
│       │   │   └── agent_step.py
│       │   ├── schemas/
│       │   ├── services/
│       │   │   ├── orchestration_service.py
│       │   │   ├── retrieval_service.py
│       │   │   ├── routing_service.py
│       │   │   └── llm_config_service.py
│       │   ├── repositories/
│       │   └── workers/
│       │       ├── embeddings_worker.py
│       │       ├── alerts_worker.py
│       │       └── planner_worker.py
│       ├── tests/
│       └── Dockerfile
├── gateway/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── security/
│   ├── tests/
│   └── Dockerfile
└── deployment/
    ├── dev/
    │   ├── compose.yml
    │   └── env/
    ├── staging/
    └── production/
```

## Service-by-service folder notes

### User Service

This service owns user-facing profile data and operational support features, while Supabase Auth remains the identity provider that issues JWTs.[cite:168][cite:169]

Recommended modules:
- `routes/users.py`: current user, profile update, preferences.
- `routes/support.py`: ticket create, ticket reply, ticket list.
- `routes/admin_users.py`: admin-side user listing, user status updates.
- `models/`: `User`, `SupportTicket`, `Notification`.
- `services/`: business logic only, keeping routes thin.

### Trip Service

This service owns trip lifecycle and itinerary persistence, which keeps travel business logic separate from user management and AI orchestration.[cite:91][cite:94]

Recommended modules:
- `routes/trips.py`: trip CRUD.
- `routes/itineraries.py`: itinerary day/item CRUD.
- `routes/bookings.py`: booking CRUD and provider references.
- `routes/trip_alerts.py`: trip-specific disruptions and alerts.

### AI Service

This service is the intelligence layer: LangGraph handles orchestration, LangSmith handles tracing and debugging, Qdrant handles vector retrieval, and Neo4j handles route/graph traversal.[cite:111][cite:113][cite:69]

Recommended modules:
- `graph/builder.py`: build and compile the LangGraph workflow.
- `graph/state.py`: shared typed state object.
- `graph/nodes/`: one file per agent node.
- `graph/tools/`: integrations for retrieval and external APIs.
- `workers/embeddings_worker.py`: background indexing into Qdrant.
- `workers/alerts_worker.py`: scrape or ingest alerts and trigger replanning.

## Suggested database ownership

Each service should own its primary tables, even if they are hosted in the same PostgreSQL cluster for MVP simplicity. A single product can still keep logical separation by schema while avoiding excessive operational overhead.[cite:101][cite:102]

| Service | Storage ownership |
|---|---|
| User Service | `users`, `support_tickets`, `support_messages`, `notifications` |
| Trip Service | `trips`, `itinerary_days`, `itinerary_items`, `bookings`, `trip_alerts` |
| AI Service | `llm_configs`, `agent_runs`, `agent_steps`, LangGraph checkpoints |
| Shared infra | Redis keys, Qdrant collections, Neo4j graphs |

## Suggested Postgres schema split

A clean MVP setup is one Postgres cluster with separate schemas:

```text
postgres
├── auth_ext        # optional local auth mapping/cache if needed
├── user_domain     # users, support, notifications
├── trip_domain     # trips, itinerary, bookings, alerts
└── ai_domain       # llm_config, agent_runs, checkpoints
```

This keeps boundaries visible while staying easy to deploy and manage for a small team.[cite:101][cite:105]

## Redis usage in the structure

Redis should support short-lived and performance-oriented concerns such as cache, queue, and rate limiting rather than permanent business storage.[cite:153][cite:159]

Suggested key groups:

```text
ratelimit:login:{ip}
ratelimit:plan:{user_id}
cache:user:{user_id}:profile
cache:trip:{trip_id}:summary
cache:trip:{trip_id}:itinerary
queue:notifications
queue:embeddings
queue:alerts
lock:trip-plan:{trip_id}
lock:alert-process:{alert_id}
```

## Minimal root files

Recommended top-level files:

- `docker-compose.yml`: local full stack with Postgres, Redis, Qdrant, Neo4j, and all FastAPI services.
- `.env.example`: shared environment variable template.
- `Makefile`: shortcuts like `make up`, `make down`, `make test`, `make lint`.
- `README.md`: local setup, architecture summary, run commands.

## Example `.env.example`

```env
APP_ENV=development
API_GATEWAY_PORT=8080

SUPABASE_URL=
SUPABASE_JWT_SECRET=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=travel_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

REDIS_HOST=redis
REDIS_PORT=6379

QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_COLLECTION_TRAVEL=travel_items

NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4jpassword

LANGSMITH_API_KEY=
LANGSMITH_PROJECT=travel-platform
LANGCHAIN_TRACING_V2=true

OPENAI_API_KEY=
MAPS_API_KEY=
WEATHER_API_KEY=
TRANSPORT_API_KEY=
TOURISM_API_KEY=
```

## Suggested implementation phases

### Phase 1
- API Gateway.
- User Service.
- Trip Service.
- Supabase Auth integration.
- PostgreSQL schemas.
- Redis for rate limit and basic cache.[cite:168][cite:153]

### Phase 2
- AI Service with LangGraph orchestrator.
- LangSmith tracing.
- Qdrant retrieval for semantic travel search.
- Neo4j route modeling and route queries.[cite:111][cite:113][cite:69]

### Phase 3
- Background workers for embeddings and alerts.
- Support workflow improvements.
- Notification queue handling via Redis.
- Hardening, monitoring, and deployment automation.[cite:159][cite:163]

## Practical recommendation

For this MVP, keep the repository as a **modular monorepo with service folders**, not many separate repos. That gives you fast iteration, shared libraries for auth/config/db access, and still preserves clear service boundaries between user, trip, and AI domains.[cite:101][cite:102]
