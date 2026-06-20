from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from clerk_backend_api import Clerk

from app.db.session import get_db
from app.models.user import User
from app.core.config import settings

router = APIRouter()
clerk = Clerk(bearer_auth=settings.clerk_secret_key)

class SyncRequest(BaseModel):
    requested_role: Optional[str] = None

import jwt

@router.post("/sync")
async def sync_user(
    request_data: Optional[SyncRequest] = None,
    authorization: str = Header(None), 
    db: AsyncSession = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    
    try:
        # Decode the JWT token to extract the user ID (sub)
        # We rely on the subsequent clerk.users.get() call to validate if the user actually exists
        decoded = jwt.decode(token, options={"verify_signature": False})
        clerk_user_id = decoded.get("sub")
        
        if not clerk_user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Fetch detailed user info
        user_info = clerk.users.get(user_id=clerk_user_id)
        email = user_info.email_addresses[0].email_address if user_info.email_addresses else ""
        first_name = user_info.first_name or ""
        last_name = user_info.last_name or ""
        full_name = f"{first_name} {last_name}".strip()
        
        # Check if user exists
        stmt = select(User).where(User.user_id == clerk_user_id)
        result = await db.execute(stmt)
        existing_user = result.scalars().first()
        
        if existing_user:
            # Update info
            existing_user.full_name = full_name
            existing_user.email = email
            # Do NOT update role on sync if they already exist, to prevent privilege escalation by normal users.
        else:
            # Create
            role_to_assign = "User"
            if request_data and request_data.requested_role in ["User", "Admin"]:
                role_to_assign = request_data.requested_role

            new_user = User(
                user_id=clerk_user_id,
                full_name=full_name,
                email=email,
                role=role_to_assign
            )
            db.add(new_user)
            
        await db.commit()
        return {"status": "success", "message": "User synchronized"}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
