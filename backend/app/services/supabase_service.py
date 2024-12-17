from typing import Optional
from supabase import Client
from ..models.company import CompanyCreate, CompanyResponse

class SupabaseService:
    def __init__(self, db: Client):
        self.db = db

    async def get_company(self, name: str, access_code: str) -> Optional[CompanyResponse]:
        """Get company by name and access code"""
        try:
            response = self.db.table('companies').select('*')\
                .eq('name', name)\
                .eq('access_code', access_code)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return CompanyResponse(**response.data[0])
            return None
        except Exception as e:
            print(f"Error getting company: {e}")
            raise

    async def create_company(self, company: CompanyCreate) -> Optional[CompanyResponse]:
        """Create a new company"""
        try:
            response = self.db.table('companies').insert(company.model_dump())\
                .execute()
            
            if response.data and len(response.data) > 0:
                return CompanyResponse(**response.data[0])
            return None
        except Exception as e:
            print(f"Error creating company: {e}")
            raise

    async def check_company_exists(self, name: str) -> bool:
        """Check if company exists by name"""
        try:
            response = self.db.table('companies').select('id')\
                .eq('name', name)\
                .execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error checking company existence: {e}")
            raise