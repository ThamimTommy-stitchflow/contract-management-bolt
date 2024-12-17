from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from ..database import get_db
from ..models.company import CompanyCreate, CompanyResponse, CompanyAuth
from ..services.supabase_service import SupabaseService

router = APIRouter()

@router.post("/auth", response_model=CompanyResponse)
async def authenticate_company(
    auth_data: CompanyAuth,
    db: Client = Depends(get_db)
):
    """Authenticate a company with name and access code"""
    service = SupabaseService(db)
    try:
        # Try to get existing company
        company = await service.get_company(auth_data.name, auth_data.access_code)
        if company:
            return company
        
        raise HTTPException(
            status_code=401,
            detail="Invalid organization name or access code"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/register", response_model=CompanyResponse)
async def register_company(
    company: CompanyCreate,
    db: Client = Depends(get_db)
):
    """Register a new company"""
    service = SupabaseService(db)
    try:
        # Check if company already exists
        exists = await service.check_company_exists(company.name)
        if exists:
            raise HTTPException(
                status_code=400,
                detail="Organization name already exists"
            )
        
        # Create new company
        new_company = await service.create_company(company)
        if new_company:
            return new_company
        
        raise HTTPException(
            status_code=500,
            detail="Failed to create organization"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )