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

@router.get("/{app_id}", response_model=Optional[AppResponse])
async def get_app_by_id(
    app_id: str,
    db: Client = Depends(get_db)
):
    """Get app details by ID"""
    service = AppService(db)
    try:
        app = await service.get_app_by_id(app_id)
        if not app:
            raise HTTPException(status_code=404, detail="App not found")
        return app
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/list_upload", response_model=dict)
async def upload_app_list(
    data: dict,
    db: Client = Depends(get_db)
):
    """Upload a list of apps and associate them with a company"""
    company_id = data.get('company_id')
    app_list = data.get('app_list')
    
    if not company_id:
        raise HTTPException(status_code=400, detail="company_id is required")
    if not app_list:
        raise HTTPException(status_code=400, detail="app_list is required")
        
    service = AppService(db)
    
    # Input validation
    if not app_list or not app_list.strip():
        raise HTTPException(status_code=400, detail="App list cannot be empty")
    
    try:
        # Split and clean the app names
        app_names = [name.strip() for name in app_list.split(',') if name.strip()]
        app_names = list(dict.fromkeys(app_names))
        
        if not app_names:
            raise HTTPException(status_code=400, detail="No valid app names provided")
        
        results = []
        # Step 1: Get existing company apps for checking
        existing_company_apps = await service.get_company_apps(company_id)
        existing_company_app_names = {app.name.lower() for app in existing_company_apps}
        
        # Step 2: Get all apps from the database for case-insensitive lookup
        all_apps = await service.get_all_apps()
        all_app_names = {app.name.lower(): app for app in all_apps}
        
        for app_name in app_names:
            if app_name.lower() in existing_company_app_names:
                continue
            
            existing_app = all_app_names.get(app_name.lower())
            
            if not existing_app:
                new_app = AppCreate(
                    name=app_name,
                    category="CSV Uploads",
                    is_predefined=False,
                    api_support=False
                )
                app = await service.create_app(new_app)
            else:
                app = existing_app
            
            # Associate app with company and create default contract and service
            company_app = CompanyAppCreate(company_id=company_id, app_id=app.id)
            await service.select_app_with_defaults(company_app)  # New method to handle all creation
            results.append(app)
            
        return {
            "message": f"Successfully processed {len(results)} new apps",
            "apps": results
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company/{company_id}/with-contracts", response_model=List[AppResponse])
async def get_company_apps_with_contracts(
    company_id: str,
    db: Client = Depends(get_db)
):
    """Get all apps selected by a company"""
    service = AppService(db)
    try:
        return await service.get_company_apps_with_contracts(company_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))