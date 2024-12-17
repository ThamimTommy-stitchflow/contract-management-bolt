from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from ..database import get_db
from supabase import Client
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Client = Depends(get_db)
):
    """Get the current authenticated user"""
    try:
        # Verify and get user from session
        user = db.auth.get_user(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_admin_user(
    current_user = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Check if the current user is an admin"""
    try:
        # Get user's role from profiles table
        response = db.table('profiles')\
            .select('role')\
            .eq('id', current_user.id)\
            .single()\
            .execute()
        
        if not response.data or response.data.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        return current_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
