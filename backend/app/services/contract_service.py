from typing import List, Optional
from datetime import datetime, date
from supabase import Client
from ..models.contract import (
    ContractCreate, 
    ContractResponse, 
    ContractUpdate
)

class ContractService:
    def __init__(self, db: Client):
        self.db = db

    async def get_company_contracts(self, company_id: str) -> List[ContractResponse]:
        """Get all contracts for a company"""
        try:
            # First get all contracts
            contracts_response = self.db.table('contracts')\
                .select('*')\
                .eq('company_id', company_id)\
                .execute()
            
            if not contracts_response.data:
                return []

            # For each contract, get its services
            result = []
            for contract in contracts_response.data:
                services_response = self.db.table('services')\
                    .select('*')\
                    .eq('contract_id', contract['id'])\
                    .execute()
                
                contract['services'] = services_response.data
                result.append(ContractResponse(**contract))
            
            return result
        except Exception as e:
            print(f"Error getting company contracts: {e}")
            raise

    async def create_contract(self, contract: ContractCreate) -> ContractResponse:
        """Create a new contract with services"""
        try:
            # Convert date strings from DD/MM/YYYY to YYYY-MM-DD if needed
            if isinstance(contract.renewal_date, str):
                try:
                    date_obj = datetime.strptime(contract.renewal_date, '%d/%m/%Y')
                    contract.renewal_date = date_obj.date().isoformat()
                except ValueError:
                    pass  # If date is already in correct format, skip conversion

            if isinstance(contract.review_date, str):
                try:
                    date_obj = datetime.strptime(contract.review_date, '%d/%m/%Y')
                    contract.review_date = date_obj.date().isoformat()
                except ValueError:
                    pass  # If date is already in correct format, skip conversion

            # Verify company_app exists
            company_app = self.db.table('company_apps')\
                .select('*')\
                .eq('company_id', contract.company_id)\
                .eq('app_id', contract.app_id)\
                .execute()
            
            if not company_app.data:
                raise ValueError("Invalid company_app combination")

            # Check if contract already exists
            existing_contract = self.db.table('contracts')\
                .select('*')\
                .eq('company_id', contract.company_id)\
                .eq('app_id', contract.app_id)\
                .execute()
            
            if existing_contract.data:
                raise ValueError("Contract already exists for this app")

            # Create contract
            contract_data = contract.model_dump(exclude={'services'})
            contract_response = self.db.table('contracts')\
                .insert(contract_data)\
                .execute()
            
            if not contract_response.data:
                raise ValueError("Failed to create contract")

            contract_id = contract_response.data[0]['id']
            
            # Create services
            if contract.services:
                services_data = [
                    {**service.model_dump(), "contract_id": contract_id}
                    for service in contract.services
                ]
                
                self.db.table('services')\
                    .insert(services_data)\
                    .execute()

            return await self.get_contract(contract_id)
        except Exception as e:
            print(f"Error creating contract: {e}")
            raise

    async def get_contract(self, contract_id: str) -> Optional[ContractResponse]:
        """Get a contract by ID with its services"""
        try:
            contract_response = self.db.table('contracts')\
                .select('*')\
                .eq('id', contract_id)\
                .execute()
            
            if not contract_response.data:
                return None

            contract = contract_response.data[0]
            
            # Get services
            services_response = self.db.table('services')\
                .select('*')\
                .eq('contract_id', contract_id)\
                .execute()
            
            contract['services'] = services_response.data
            return ContractResponse(**contract)
        except Exception as e:
            print(f"Error getting contract: {e}")
            raise

    async def update_contract(
        self, 
        contract_id: str, 
        company_id: str,
        contract_update: ContractUpdate
    ) -> Optional[ContractResponse]:
        """Update a contract and its services"""
        try:
            # Verify contract belongs to company
            existing = await self.get_contract(contract_id)
            if not existing or existing.company_id != company_id:
                return None

            update_data = contract_update.model_dump(
                exclude={'services'}, 
                exclude_unset=True
            )
            
            if update_data:
                update_data['updated_at'] = datetime.utcnow()
                self.db.table('contracts')\
                    .update(update_data)\
                    .eq('id', contract_id)\
                    .execute()

            # Update services if provided
            if contract_update.services is not None:
                # Delete existing services
                self.db.table('services')\
                    .delete()\
                    .eq('contract_id', contract_id)\
                    .execute()
                
                # Create new services
                if contract_update.services:
                    services_data = [
                        {**service.model_dump(), "contract_id": contract_id}
                        for service in contract_update.services
                    ]
                    self.db.table('services')\
                        .insert(services_data)\
                        .execute()

            return await self.get_contract(contract_id)
        except Exception as e:
            print(f"Error updating contract: {e}")
            raise

    async def delete_contract(self, contract_id: str, company_id: str) -> bool:
        """Delete a contract and its services"""
        try:
            response = self.db.table('contracts')\
                .delete()\
                .eq('id', contract_id)\
                .eq('company_id', company_id)\
                .execute()
            
            return bool(response.data)
        except Exception as e:
            print(f"Error deleting contract: {e}")
            raise