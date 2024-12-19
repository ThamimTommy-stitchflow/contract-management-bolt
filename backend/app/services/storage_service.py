from supabase import Client, create_client
from fastapi import UploadFile, HTTPException
from typing import Optional, Tuple
import os
from datetime import datetime
from ..config import get_settings

class StorageService:
    def __init__(self, db: Client):
        self.settings = get_settings()
        self.bucket_name = self.settings.supabase_storage_bucket
        # Initialize with service role key for admin operations if needed
        self.admin_client = create_client(
            self.settings.supabase_url,
            self.settings.supabase_service_key
        ) if hasattr(self.settings, 'supabase_service_key') else None
        self.db = db

    def _generate_safe_filename(self, original_filename: str) -> str:
        """Generate a safe filename with timestamp to avoid collisions"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_name = os.path.splitext(original_filename)[0]
        extension = os.path.splitext(original_filename)[1]
        safe_name = f"{base_name}_{timestamp}{extension}".lower().replace(' ', '_')
        return safe_name

    async def upload_contract_file(
        self,
        company_id: str,
        contract_id: str,
        file: UploadFile
    ) -> Tuple[str, str]:
        """Upload a contract file and return both storage path and public URL"""
        try:
            if not file.content_type == 'application/pdf':
                raise ValueError("Only PDF files are allowed")

            safe_filename = self._generate_safe_filename(file.filename)
            file_path = f"{company_id}/{contract_id}/{safe_filename}"

            content = await file.read()
            
            try:
                # Try uploading with regular client first
                response = self.db.storage \
                    .from_(self.bucket_name) \
                    .upload(
                        file_path,
                        content,
                        {"contentType": "application/pdf"}
                    )
                
                if not response.data:
                    raise ValueError("Upload failed - no response data")
                if response.error:
                    raise ValueError(f"Upload failed: {response.error.message}")

            except Exception as upload_error:
                print(f"Regular upload failed: {upload_error}")
                if self.admin_client:
                    # Fallback to admin client if available
                    response = self.admin_client.storage \
                        .from_(self.bucket_name) \
                        .upload(
                            file_path,
                            content,
                            {"contentType": "application/pdf"}
                        )
                else:
                    raise

            # Get public URL for the file
            file_url = self.db.storage \
                .from_(self.bucket_name) \
                .get_public_url(file_path)
            print(f"File URL: {file_url}")
            return file_path, file_url

        except Exception as e:
            print(f"Error uploading file: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload file: {str(e)}"
            )
        finally:
            await file.close()

    async def download_contract_file(self, file_path: str) -> Optional[bytes]:
        """Download a contract file by its path"""
        try:
            response = self.db.storage \
                .from_(self.bucket_name) \
                .download(file_path)
            
            if not response:
                raise ValueError("File not found")
                
            return response

        except Exception as e:
            print(f"Error downloading file: {str(e)}")
            if "not found" in str(e).lower():
                raise HTTPException(status_code=404, detail="File not found")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to download file: {str(e)}"
            )

    async def delete_contract_file(self, file_path: str) -> bool:
        """Delete a contract file from storage"""
        try:
            response = self.db.storage \
                .from_(self.bucket_name) \
                .remove([file_path])
            
            return bool(response)

        except Exception as e:
            print(f"Error deleting file: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete file: {str(e)}"
            )