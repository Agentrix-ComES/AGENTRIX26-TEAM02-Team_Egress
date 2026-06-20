from typing import Optional
from datetime import datetime

import jwt
from clerk_backend_api import Clerk
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.user import User
from app.core.config import settings

router = APIRouter()
clerk = Clerk(bearer_auth=settings.clerk_secret_key)


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}


class SyncRequest(BaseModel):
    requested_role: Optional[str] = None


class UserOut(BaseModel):
    user_id: str
    full_name: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


def _extract_clerk_sub(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ", 1)[1]
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc
    sub = decoded.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return sub


async def _load_user(db: AsyncSession, clerk_user_id: str) -> User:
    result = await db.execute(select(User).where(User.user_id == clerk_user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not yet synchronized")
    return user


@router.post("/sync")
async def sync_user(
    request_data: Optional[SyncRequest] = None,  # accepted but ignored for role
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    clerk_user_id = _extract_clerk_sub(authorization)
    try:
        user_info = clerk.users.get(user_id=clerk_user_id)
        email = user_info.email_addresses[0].email_address if user_info.email_addresses else ""
        full_name = f"{user_info.first_name or ''} {user_info.last_name or ''}".strip()

        role = "Admin" if email and email.lower() in settings.admin_email_set else "User"

        result = await db.execute(select(User).where(User.user_id == clerk_user_id))
        existing_user = result.scalars().first()

        if existing_user:
            existing_user.full_name = full_name
            existing_user.email = email
            existing_user.role = role
        else:
            db.add(User(
                user_id=clerk_user_id,
                full_name=full_name,
                email=email,
                role=role,
            ))

        await db.commit()
        return {"status": "success", "message": "User synchronized", "role": role}
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=401, detail=f"Authentication failed: {e}") from e


@router.get("/me", response_model=UserOut)
async def get_me(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    clerk_user_id = _extract_clerk_sub(authorization)
    user = await _load_user(db, clerk_user_id)
    return UserOut.model_validate(user)


@router.get("", response_model=list[UserOut])
async def list_users(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
) -> list[UserOut]:
    clerk_user_id = _extract_clerk_sub(authorization)
    caller = await _load_user(db, clerk_user_id)
    if caller.role != "Admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return [UserOut.model_validate(u) for u in result.scalars().all()]
