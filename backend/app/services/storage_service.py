from supabase import Client
from fastapi import UploadFile
from typing import Optional, Tuple
import os
import time
from datetime import datetime
from ..config import get_settings

class StorageService:
    def __init__(self, db: Client):
        self.db = db
        self.settings = get_settings()
        self.bucket_name = self.settings.supabase_storage_bucket

    def _generate_safe_filename(self, original_filename: str) -> str:
        """Generate a safe filename with timestamp to avoid collisions"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_name = os.path.splitext(original_filename)[0]
        extension = os.path.splitext(original_filename)[1]
        safe_name = f"{base_name}_{timestamp}{extension}".replace(' ', '_')
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

            # Create safe filename with timestamp
            safe_filename = self._generate_safe_filename(file.filename)
            
            # Create path structure: company_id/contract_id/filename
            file_path = f"{company_id}/{contract_id}/{safe_filename}"
            
            # Read file content
            content = await file.read()
            
            # Upload to Supabase storage
            response = self.db.storage\
                .from_(self.bucket_name)\
                .upload(
                    file_path,
                    content,
                    {"content-type": "application/pdf", "cacheControl": "3600"}
                )
            
            if not response.data:
                raise ValueError("Failed to upload file")

            # Get public URL for the file
            file_url = self.db.storage\
                .from_(self.bucket_name)\
                .get_public_url(file_path)

            return file_path, file_url

        except Exception as e:
            print(f"Error uploading file: {e}")
            raise
        finally:
            await file.close()

    async def download_contract_file(self, file_path: str) -> Optional[bytes]:
        """Download a contract file by its path"""
        try:
            response = self.db.storage\
                .from_(self.bucket_name)\
                .download(file_path)
            
            return response
        except Exception as e:
            print(f"Error downloading file: {e}")
            raise

    async def delete_contract_file(self, file_path: str) -> bool:
        """Delete a contract file from storage"""
        try:
            response = self.db.storage\
                .from_(self.bucket_name)\
                .remove([file_path])
            
            return bool(response)
        except Exception as e:
            print(f"Error deleting file: {e}")
            raise