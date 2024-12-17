from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date
from ..database import get_supabase_client

router = APIRouter()

class ServiceBase(BaseModel):
    name: str
    license_type: str
    pricing_model: str
    cost_per_user: Optional[float] = None
    number_of_licenses: Optional[int] = None
    total_cost: Optional[float] = None

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: str
    contract_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ContractBase(BaseModel):
    app_id: str
    renewal_date: Optional[date] = None
    review_date: Optional[date] = None
    overall_total_value: Optional[float] = None
    contract_file_url: Optional[str] = None
    notes: Optional[str] = None
    contact_details: Optional[str] = None

class ContractCreate(ContractBase):
    services: List[ServiceCreate]

class Contract(ContractBase):
    id: str
    created_at: datetime
    updated_at: datetime
    services: List[Service]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[Contract])
async def get_contracts(
    app_id: Optional[str] = None,
    supabase=Depends(get_supabase_client)
):
    """Get all contracts with optional filtering by app_id"""
    try:
        query = supabase.table("contracts").select("*, services(*)")
        
        if app_id:
            query = query.eq("app_id", app_id)
        
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Contract)
async def create_contract(
    contract: ContractCreate,
    supabase=Depends(get_supabase_client)
):
    """Create a new contract with services"""
    try:
        # Create contract
        contract_data = contract.dict(exclude={'services'})
        contract_response = supabase.table("contracts").insert(contract_data).execute()
        
        if not contract_response.data:
            raise HTTPException(status_code=400, detail="Failed to create contract")
        
        contract_id = contract_response.data[0]['id']
        
        # Create services
        services_data = [
            {**service.dict(), "contract_id": contract_id}
            for service in contract.services
        ]
        
        services_response = supabase.table("services").insert(services_data).execute()
        
        if not services_response.data:
            # Rollback contract creation
            supabase.table("contracts").delete().eq("id", contract_id).execute()
            raise HTTPException(status_code=400, detail="Failed to create services")
        
        # Return complete contract with services
        return {
            **contract_response.data[0],
            "services": services_response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{contract_id}", response_model=Contract)
async def get_contract(
    contract_id: str,
    supabase=Depends(get_supabase_client)
):
    """Get a specific contract by ID"""
    try:
        response = supabase.table("contracts").select("*, services(*)").eq("id", contract_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Contract not found")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{contract_id}", response_model=Contract)
async def update_contract(
    contract_id: str,
    contract: ContractCreate,
    supabase=Depends(get_supabase_client)
):
    """Update a contract and its services"""
    try:
        # Update contract
        contract_data = contract.dict(exclude={'services'})
        contract_data["updated_at"] = datetime.utcnow().isoformat()
        
        contract_response = supabase.table("contracts").update(contract_data).eq("id", contract_id).execute()
        
        if not contract_response.data:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        # Delete existing services
        supabase.table("services").delete().eq("contract_id", contract_id).execute()
        
        # Create new services
        services_data = [
            {**service.dict(), "contract_id": contract_id}
            for service in contract.services
        ]
        
        services_response = supabase.table("services").insert(services_data).execute()
        
        return {
            **contract_response.data[0],
            "services": services_response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: str,
    supabase=Depends(get_supabase_client)
):
    """Delete a contract and its services"""
    try:
        # Delete services first (foreign key constraint)
        supabase.table("services").delete().eq("contract_id", contract_id).execute()
        
        # Delete contract
        response = supabase.table("contracts").delete().eq("id", contract_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Contract not found")
            
        return {"message": "Contract deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{contract_id}/upload")
async def upload_contract_file(
    contract_id: str,
    file: UploadFile = File(...),
    supabase=Depends(get_supabase_client)
):
    """Upload a contract file (PDF)"""
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Upload file to Supabase storage
        file_path = f"contracts/{contract_id}/{file.filename}"
        response = supabase.storage.from_("contracts").upload(
            file_path,
            file.file.read()
        )
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to upload file")
        
        # Get public URL
        file_url = supabase.storage.from_("contracts").get_public_url(file_path)
        
        # Update contract with file URL
        contract_response = supabase.table("contracts").update({
            "contract_file_url": file_url,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", contract_id).execute()
        
        if not contract_response.data:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        return {"message": "File uploaded successfully", "file_url": file_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
