from fastapi import APIRouter, Depends, HTTPException
from fastapi import UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
import io
from ..services.contract_processor import ContractProcessor
from ..services.storage_service import StorageService
from typing import List
from supabase import Client
from ..database import get_db
from ..models.contract import ContractCreate, ContractResponse, ContractUpdate
from ..services.contract_service import ContractService

router = APIRouter()

@router.get("/company/{company_id}", response_model=List[ContractResponse])
async def get_company_contracts(
    company_id: str,
    db: Client = Depends(get_db)
):
    """Get all contracts for a company"""
    service = ContractService(db)
    try:
        return await service.get_company_contracts(company_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=ContractResponse)
async def create_contract(
    contract: ContractCreate,
    db: Client = Depends(get_db)
):
    """Create a new contract with services"""
    service = ContractService(db)
    try:
        return await service.create_contract(contract)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    db: Client = Depends(get_db)
):
    """Get a contract by ID"""
    service = ContractService(db)
    try:
        contract = await service.get_contract(contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        return contract
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: str,
    contract_update: ContractUpdate,
    company_id: str,  # We'll get this from auth in future
    db: Client = Depends(get_db)
):
    """Update a contract and its services"""
    service = ContractService(db)
    try:
        updated = await service.update_contract(contract_id, company_id, contract_update)
        if not updated:
            raise HTTPException(status_code=404, detail="Contract not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: str,
    company_id: str,  # We'll get this from auth in future
    db: Client = Depends(get_db)
):
    """Delete a contract"""
    service = ContractService(db)
    try:
        success = await service.delete_contract(contract_id, company_id)
        if not success:
            raise HTTPException(status_code=404, detail="Contract not found")
        return {"message": "Contract deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process")
async def process_contract_file(
    file: UploadFile = File(...),
    db: Client = Depends(get_db)
):
    """Process a contract file and extract information"""
    processor = ContractProcessor()
    
    try:
        # Extract data from contract
        extracted_data = await processor.process_contract(file)
        
        return {
            "message": "Contract processed successfully",
            "data": extracted_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing contract: {str(e)}"
        )

@router.post("/{contract_id}/upload")
async def upload_contract_file(
    contract_id: str,
    company_id: str,
    file: UploadFile = File(...),
    db: Client = Depends(get_db)
):
    """Upload and process a contract file"""
    storage_service = StorageService(db)
    contract_service = ContractService(db)
    processor = ContractProcessor()
    
    try:
        # First process the contract
        extracted_data = await processor.process_contract(file)
        
        # Reset file position for upload
        await file.seek(0)
        
        # Upload file
        file_path, file_url = await storage_service.upload_contract_file(
            company_id,
            contract_id,
            file
        )
        
        # Update contract with file information
        update = ContractUpdate(
            contract_file_url=file_url,
            contract_file_path=file_path  # Add this field to ContractUpdate model
        )
        updated_contract = await contract_service.update_contract(
            contract_id,
            company_id,
            update
        )

        return {
            "message": "Contract uploaded and processed successfully",
            "extracted_data": extracted_data,
            "contract": updated_contract
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{contract_id}/download")
async def download_contract_file(
    contract_id: str,
    company_id: str,
    db: Client = Depends(get_db)
):
    """Download a contract file"""
    storage_service = StorageService(db)
    contract_service = ContractService(db)
    
    try:
        # Get contract to get file path
        contract = await contract_service.get_contract(contract_id)
        if not contract or contract.company_id != company_id:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        if not contract.contract_file_path:
            raise HTTPException(status_code=404, detail="No file associated with this contract")
        
        # Download file
        file_data = await storage_service.download_contract_file(contract.contract_file_path)
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found in storage")
        
        return StreamingResponse(
            io.BytesIO(file_data),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="contract_{contract_id}.pdf"'
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    """Upload a contract file"""
    storage_service = StorageService(db)
    contract_service = ContractService(db)
    
    try:
        # Verify contract exists and belongs to company
        contract = await contract_service.get_contract(contract_id)
        if not contract or contract.company_id != company_id:
            raise HTTPException(status_code=404, detail="Contract not found")

        # Upload file
        file_url = await storage_service.upload_contract_file(
            company_id,
            contract_id,
            file
        )
        
        if not file_url:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload file"
            )

        # Update contract with file URL
        update = ContractUpdate(contract_file_url=file_url)
        updated_contract = await contract_service.update_contract(
            contract_id,
            company_id,
            update
        )

        return {
            "message": "File uploaded successfully",
            "file_url": file_url,
            "contract": updated_contract
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))