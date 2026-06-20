# User Service

This microservice handles user management, authentication synchronization with Clerk, and PostgreSQL data persistence for users.

## Setup

1. Copy `.env.example` to `.env` (or run using root `.env.local`).
2. Run with `uv run uvicorn app.main:app --reload --port 8001`.
