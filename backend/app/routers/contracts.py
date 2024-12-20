from fastapi import APIRouter, Depends, HTTPException
from fastapi import UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
import io
from ..services.contract_processor import ContractProcessor
from ..services.storage_service import StorageService
from typing import List
from supabase import Client
from ..database import get_db
from ..models.contract import ContractCreate, ContractResponse, ContractUpdate, ServiceUpdate
from ..services.contract_service import ContractService
from datetime import datetime

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
    print(contract)
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

@router.put("/{contract_id}/services")
async def update_contract_services(
    contract_id: str,
    services: List[ServiceUpdate],
    company_id: str,  # We'll get this from auth in future
    db: Client = Depends(get_db)
):
    """Update services for a contract"""
    service = ContractService(db)
    try:
        # First verify the contract exists and belongs to the company
        contract = await service.get_contract(contract_id)
        if not contract or contract.company_id != company_id:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        # Convert services to dict format
        services_data = [
            {
                "name": s.name,
                "license_type": s.license_type,
                "pricing_model": s.pricing_model,
                "cost_per_user": s.cost_per_user,
                "number_of_licenses": s.number_of_licenses,
                "total_cost": s.total_cost
            }
            for s in services
        ]
        
        # Update services using the service method
        await service.update_contract_services(contract_id, services_data)
        
        # Return updated contract
        return await service.get_contract(contract_id)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating services: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process")
async def process_contract_file(
    company_id: str,
    file: UploadFile = File(...),
    db: Client = Depends(get_db)
):
    """Process a contract file and extract information"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
        
    processor = ContractProcessor()
    storage_service = StorageService(db)
    contract_service = ContractService(db)
    
    try:
        # Extract data from contract
        try:
            extracted_data = await processor.process_contract(file)
            print("Extracted data:", extracted_data)
        except Exception as e:
            print(f"Contract processing error: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail=f"Failed to process contract: {str(e)}"
            )
        
        # Reset file position for storage
        await file.seek(0)
        
        try:
            # Check if app exists, if not create it
            app_data = {
                "name": extracted_data.app_name,
                "category": extracted_data.category,
                "api_supported": False,
                "is_predefined": False
            }

            print(app_data)
            
            app_response = db.table('apps')\
                .select('id')\
                .eq('name', extracted_data.app_name)\
                .execute()
                
            if not app_response.data:
                app_response = db.table('apps')\
                    .insert(app_data)\
                    .execute()
            
            if not app_response.data:
                raise ValueError("Failed to create or find app")
                
            app_id = app_response.data[0]['id']
            
            # Check if company_app exists, if not create it
            db.table('company_apps')\
                .upsert({
                    "company_id": company_id,
                    "app_id": app_id
                })\
                .execute()
        
        except Exception as e:
            print(f"Database error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save app data: {str(e)}"
            )
        
        try:
            # Create contract
            # Debug print statements
            print("Raw renewal date:", extracted_data.renewal_date)
            print("Raw renewal date type:", type(extracted_data.renewal_date))
            print("Raw review date:", extracted_data.review_date)
            print("Raw review date type:", type(extracted_data.review_date))

            # Handle dates that might be strings or datetime objects
            renewal_date = extracted_data.renewal_date
            if renewal_date:
                try:
                    if isinstance(renewal_date, str):
                        # Try parsing DD/MM/YYYY format
                        parsed_date = datetime.strptime(renewal_date, '%d/%m/%Y').date()
                        renewal_date = parsed_date.strftime('%Y-%m-%d')
                    else:
                        renewal_date = renewal_date.strftime('%Y-%m-%d')
                except ValueError as e:
                    print(f"Error parsing renewal_date: {e}")
                    renewal_date = None

            review_date = extracted_data.review_date
            if review_date:
                try:
                    if isinstance(review_date, str):
                        # Try parsing DD/MM/YYYY format
                        parsed_date = datetime.strptime(review_date, '%d/%m/%Y').date()
                        review_date = parsed_date.strftime('%Y-%m-%d')
                    else:
                        review_date = review_date.strftime('%Y-%m-%d')
                except ValueError as e:
                    print(f"Error parsing review_date: {e}")
                    review_date = None

            print("Processed renewal date:", renewal_date)
            print("Processed review date:", review_date)

            stitchflow_connection = 'API Supported' if app_response.data else 'CSV Upload/API coming soon'
            contract_data = ContractCreate(
                company_id=company_id,
                app_id=app_id,
                renewal_date=renewal_date,
                review_date=review_date,
                contract_file_url=None,
                notes=extracted_data.notes,
                contact_details=extracted_data.contact_details,
                overall_total_value=extracted_data.overall_total_cost,
                services=extracted_data.services,
                stitchflow_connection=stitchflow_connection
            )
            
            print("Contract data:", contract_data.model_dump())
            contract = await contract_service.create_contract(contract_data)
            
            print("Entering upload file to storage")
            # Upload file to storage
            try:
                file_path, file_url = await storage_service.upload_contract_file(
                    company_id,
                    contract.id,
                    file
                )
            except Exception as upload_error:
                # Fallback to admin client
                if storage_service.admin_client:
                    content = await file.read()
                    file_path = f"{company_id}/{contract.id}/{file.filename}"
                    response = storage_service.admin_client.storage \
                        .from_(storage_service.bucket_name) \
                        .upload(
                            file_path,
                            content,
                            {"contentType": file.content_type}
                        )
                    file_url = storage_service.admin_client.storage \
                        .from_(storage_service.bucket_name) \
                        .get_public_url(file_path)
                else:
                    raise upload_error
            
            print("Exiting upload file to storage")
            
            # Update contract with file information
            update_data = {
                "contract_file_url": file_url,
            }
            
            updated_contract = await contract_service.update_contract(
                contract.id,
                company_id,
                ContractUpdate(**update_data)
            )
            
            return {
                "message": "Contract processed and stored successfully",
                "contract": updated_contract,
                "app_id": app_id
            }
            
        except Exception as e:
            print(f"Contract creation error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create contract: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
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

@router.post("/test-upload")
async def test_file_upload(
    file: UploadFile = File(...),
    db: Client = Depends(get_db)
):
    """Test endpoint for file uploads"""
    storage_service = StorageService(db)
    try:
        content = await file.read()
        test_path = f"test/{file.filename}"
        
        # Try with regular client
        print("Attempting upload with regular client...")
        try:
            response = storage_service.db.storage \
                .from_(storage_service.bucket_name) \
                .upload(
                    test_path,
                    content,
                    {"contentType": file.content_type}
                )
            print("Regular client response:", response)
        except Exception as e:
            print("Regular client error:", str(e))

        # Try with admin client
        print("Attempting upload with admin client...")
        try:
            response = storage_service.admin_client.storage \
                .from_(storage_service.bucket_name) \
                .upload(
                    test_path,
                    content,
                    {"contentType": file.content_type}
                )
            print("Admin client response:", response)
        except Exception as e:
            print("Admin client error:", str(e))

        return {"message": "Test complete - check logs"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))