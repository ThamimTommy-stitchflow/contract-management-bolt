from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from supabase import Client
from ..database import get_db
from ..models.app import AppResponse, AppCategory, CompanyAppCreate, AppCreate
from ..services.app_service import AppService
from ..dependencies.auth import get_admin_user

router = APIRouter()

@router.get("", response_model=List[AppResponse])
async def get_apps(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Client = Depends(get_db)
):
    """Get all available apps with optional filtering"""
    service = AppService(db)
    try:
        return await service.get_all_apps(category, search)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company/{company_id}", response_model=List[AppResponse])
async def get_company_apps(
    company_id: str,
    db: Client = Depends(get_db)
):
    """Get all apps selected by a company"""
    service = AppService(db)
    try:
        return await service.get_company_apps(company_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/select", status_code=201)
async def select_app(
    app_selection: CompanyAppCreate,
    db: Client = Depends(get_db)
):
    """Select an app for a company"""
    service = AppService(db)
    try:
        success = await service.select_app(app_selection)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to select app")
        return {"message": "App selected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/select/{company_id}/{app_id}")
async def unselect_app(
    company_id: str,
    app_id: str,
    db: Client = Depends(get_db)
):
    """Remove an app selection for a company"""
    service = AppService(db)
    try:
        success = await service.unselect_app(company_id, app_id)
        if not success:
            raise HTTPException(status_code=404, detail="App selection not found")
        return {"message": "App unselected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=AppResponse, status_code=201)
async def create_app(
    app: AppCreate,
    db: Client = Depends(get_db),
    _: dict = Depends(get_admin_user) 
):
    """Create a new app (admin only)"""
    service = AppService(db)
    try:
        return await service.create_app(app)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))