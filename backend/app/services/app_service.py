from typing import List, Optional
from supabase import Client
from ..models.app import AppCreate, AppResponse, AppCategory, CompanyAppCreate, CompanyAppWithContractResponse
from ..models.contract import ContractResponse
from ..models.contract import ContractBase, ServiceCreate, LicenseType, PricingModel

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
            # Check if this specific company-app combination already exists
            existing = self.db.table('company_apps')\
                .select('*')\
                .eq('company_id', app_selection.company_id)\
                .eq('app_id', app_selection.app_id)\
                .execute()
            
            if existing.data:
                # This company already has this app selected
                return True
            
            # Create new company-app association
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

    async def get_app_by_name(self, name: str) -> Optional[AppResponse]:
        """Get app by name (case-insensitive)"""
        try:
            result = self.db.table('apps').select('*').ilike('name', name).execute()
            if result.data and len(result.data) > 0:
                return AppResponse(**result.data[0])
            return None
        except Exception as e:
            raise Exception(f"Error getting app by name: {str(e)}")

    async def get_app_by_id(self, app_id: str) -> Optional[AppResponse]:
        """Get app details by ID"""
        try:
            response = self.db.table('apps')\
                .select('*')\
                .eq('id', app_id)\
                .single()\
                .execute()
            
            if not response.data:
                return None
                
            return AppResponse(**response.data)
        except Exception as e:
            print(f"Error getting app by ID: {e}")
            raise

    async def get_company_apps_with_contracts(self, company_id: str) -> List[AppResponse]:
        """Get all apps selected by a company"""
        try:
            # Get all company apps with their details
            apps_response = self.db.table('company_apps')\
                .select('apps!inner(*)')\
                .eq('company_id', company_id)\
                .execute()
            
            if not apps_response.data:
                return []

            # Process the response to create AppResponse objects
            result = []
            for row in apps_response.data:
                app_data = row['apps']
                app = AppResponse(
                    id=app_data['id'],
                    name=app_data['name'],
                    category=app_data['category'],
                    is_predefined=app_data['is_predefined'],
                    api_supported=app_data.get('api_supported', False)
                )
                result.append(app)

            return result
        except Exception as e:
            print(f"Error getting company apps: {e}")
            raise

    async def select_app_with_defaults(self, app_selection: CompanyAppCreate) -> bool:
        """Select an app for a company and create default contract and service"""
        try:
            # First select the app
            await self.select_app(app_selection)
            
            # Create default contract using ContractBase
            contract_data = ContractBase(
                company_id=app_selection.company_id,
                app_id=app_selection.app_id,
                plan_name=None,
                renewal_date=None,
                review_date=None,
                overall_total_value=None,
                contract_file_url=None,
                notes=None,
                contact_details=None,
                stitchflow_connection="API Supported",
                primary_app_owner=None,
                secondary_app_owner=None,
                access_review_cycle='Ad-Hoc',
                security_tier='Tier 1'
            ).model_dump()
            
            # Create contract
            contract_response = self.db.table('contracts')\
                .insert(contract_data)\
                .execute()
            
            if not contract_response.data:
                raise Exception("Failed to create contract")

            contract_id = contract_response.data[0]['id']
            print("contract_id", contract_id)
            
            # Debug the service data
            service_data = {
                'contract_id': contract_id,
                'name': "Default Service",
                'license_type': LicenseType.MONTHLY,
                'pricing_model': PricingModel.FLAT,
                'cost_per_user': None,
                'number_of_licenses': None,
                'total_cost': None
            }
            print("service_data before model_dump:", service_data)
            
            # Create service directly with dict instead of using model
            service_response = self.db.table('services')\
                .insert(service_data)\
                .execute()
            
            if not service_response.data:
                raise Exception("Failed to create service")
            
            print("service created successfully")
            return True
            
        except Exception as e:
            print(f"Error in select_app_with_defaults: {e}")
            raise