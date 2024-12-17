from fastapi import APIRouter, HTTPException, Depends, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from ..database import get_db
from typing import Optional
from pydantic import BaseModel
from supabase import Client

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(user: UserCreate, db: Client = Depends(get_db)):
    """Sign up a new user"""
    try:
        response = db.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        return {"message": "User created successfully", "user": response.user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Client = Depends(get_db)
):
    """Login and get access token"""
    try:
        response = db.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": response.user
        }
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
