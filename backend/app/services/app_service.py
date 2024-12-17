from typing import List, Optional
from supabase import Client
from ..models.app import AppCreate, AppResponse, AppCategory, CompanyAppCreate

class AppService:
    def __init__(self, db: Client):
        self.db = db

    async def get_all_apps(
        self, 
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[AppResponse]:
        """Get all available apps with optional filtering"""
        try:
            query = self.db.table('apps').select('*')
            print(category)
            
            if category:
                query = query.eq('category', category)
            
            if search:
                query = query.ilike('name', f'%{search}%')
            
            response = query.execute()
            return [AppResponse(**app) for app in response.data]
        except Exception as e:
            print(f"Error getting apps: {e}")
            raise

    async def get_company_apps(self, company_id: str) -> List[AppResponse]:
        """Get all apps selected by a company"""
        try:
            response = self.db.table('company_apps')\
                .select('apps!inner(*)')\
                .eq('company_id', company_id)\
                .execute()
            
            return [AppResponse(**app['apps']) for app in response.data]
        except Exception as e:
            print(f"Error getting company apps: {e}")
            raise

    async def select_app(self, app_selection: CompanyAppCreate) -> bool:
        """Select an app for a company"""
        try:
            response = self.db.table('company_apps')\
                .insert(app_selection.model_dump())\
                .execute()
            
            return bool(response.data)
        except Exception as e:
            print(f"Error selecting app: {e}")
            raise

    async def create_app(self, app: AppCreate) -> AppResponse:
        """Create a new app"""
        try:
            response = self.db.table('apps')\
                .insert(app.model_dump())\
                .execute()
            
            if not response.data:
                raise Exception("Failed to create app")
                
            return AppResponse(**response.data[0])
        except Exception as e:
            print(f"Error creating app: {e}")
            raise

    async def unselect_app(self, company_id: str, app_id: str) -> bool:
        """Remove an app selection and associated contracts for a company"""
        try:
            # First delete associated contracts and services
            self.db.table('contracts')\
                .delete()\
                .eq('company_id', company_id)\
                .eq('app_id', app_id)\
                .execute()
            
            # Then delete the company_app record
            response = self.db.table('company_apps')\
                .delete()\
                .eq('company_id', company_id)\
                .eq('app_id', app_id)\
                .execute()
            
            return bool(response.data)
        except Exception as e:
            print(f"Error unselecting app: {e}")
            raise