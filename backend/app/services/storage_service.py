from supabase import Client
from fastapi import UploadFile
from typing import Optional, Tuple
import os

class StorageService:
    def __init__(self, db: Client):
        self.db = db
        self.bucket_name = "contract-files"

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

            # Create safe filename
            timestamp = int(time.time())
            safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
            file_path = f"{company_id}/{contract_id}/{safe_filename}"
            
            content = await file.read()
            
            response = self.db.storage\
                .from_(self.bucket_name)\
                .upload(file_path, content, {"content-type": file.content_type})
            
            if not response:
                raise ValueError("Failed to upload file")

            # Get public URL
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