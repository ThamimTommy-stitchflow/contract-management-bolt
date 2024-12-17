from fastapi import APIRouter, Depends, HTTPException
from ..database import get_db
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

class UserProfile(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None

@router.get("/me")
async def get_user_profile():
    supabase = get_db()
    try:
        user = supabase.auth.get_user()
        return {"user": user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/profile")
async def update_profile(profile: UserProfile):
    supabase = get_db()
    try:
        response = supabase.from_("profiles").upsert({
            "username": profile.username,
            "full_name": profile.full_name,
            "bio": profile.bio
        }).execute()
        return {"message": "Profile updated successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
