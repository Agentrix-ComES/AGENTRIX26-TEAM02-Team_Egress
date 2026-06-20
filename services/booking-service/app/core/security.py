"""Authentication: Supabase JWT verification and current-user dependency."""
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings

# Deterministic dev user used when AUTH_DISABLED is true.
_DEV_USER_ID = UUID("00000000-0000-0000-0000-000000000001")

_bearer = HTTPBearer(auto_error=not settings.AUTH_DISABLED)


class CurrentUser(BaseModel):
    id: UUID
    email: str | None = None
    role: str = "authenticated"


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUDIENCE,
        )
    except JWTError as exc:  # pragma: no cover - exercised via API tests
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    """Resolve the authenticated user from the bearer token.

    When ``AUTH_DISABLED`` is set, a deterministic development user is returned
    so the service can be exercised locally without a Supabase session.
    """
    if settings.AUTH_DISABLED:
        return CurrentUser(id=_DEV_USER_ID, email="dev@local")

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = _decode_token(credentials.credentials)
    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )
    return CurrentUser(
        id=UUID(subject),
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
    )
