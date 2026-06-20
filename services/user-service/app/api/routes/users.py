from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from clerk_backend_api import Clerk

from app.db.session import get_db
from app.models.user import User
from app.core.config import settings

router = APIRouter()
clerk = Clerk(bearer_auth=settings.clerk_secret_key)

@router.post("/sync")
async def sync_user(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    
    try:
        # Verify the session token using Clerk Backend API
        client = clerk.clients.verify_client(token)
        if not client or not client.sessions:
            raise HTTPException(status_code=401, detail="Invalid session")
            
        session = client.sessions[0]
        clerk_user_id = session.user_id
        
        # Fetch detailed user info
        user_info = clerk.users.get(clerk_user_id)
        email = user_info.email_addresses[0].email_address if user_info.email_addresses else ""
        first_name = user_info.first_name or ""
        last_name = user_info.last_name or ""
        full_name = f"{first_name} {last_name}".strip()
        
        # Check if user exists
        stmt = select(User).where(User.user_id == clerk_user_id)
        result = await db.execute(stmt)
        existing_user = result.scalars().first()
        
        if existing_user:
            # Update
            existing_user.full_name = full_name
            existing_user.email = email
        else:
            # Create
            new_user = User(
                user_id=clerk_user_id,
                full_name=full_name,
                email=email
            )
            db.add(new_user)
            
        await db.commit()
        return {"status": "success", "message": "User synchronized"}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
