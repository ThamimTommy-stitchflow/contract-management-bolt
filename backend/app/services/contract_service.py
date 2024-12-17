from typing import List, Optional
from datetime import datetime
from supabase import Client
from ..models.contract import (
    ContractCreate, 
    ContractResponse, 
    ContractUpdate,
    ServiceCreate
)

class ContractService:
    def __init__(self, db: Client):
        self.db = db

    async def create_contract(self, contract: ContractCreate) -> ContractResponse:
        """Create a new contract with services"""
        try:
            # Start a transaction
            # First create the contract
            contract_data = contract.model_dump(exclude={'services'})
            contract_response = self.db.table('contracts').insert(contract_data)\
                .execute()
            
            if not contract_response.data:
                raise ValueError("Failed to create contract")

            contract_id = contract_response.data[0]['id']
            
            # Then create all services
            services_data = [
                {**service.model_dump(), "contract_id": contract_id}
                for service in contract.services
            ]
            
            services_response = self.db.table('services').insert(services_data)\
                .execute()
            
            if not services_response.data:
                # If services creation fails, the transaction will rollback
                raise ValueError("Failed to create services")

            # Fetch the complete contract with services
            return await self.get_contract(contract_id)
        except Exception as e:
            print(f"Error creating contract: {e}")
            raise

    async def get_contract(self, contract_id: str) -> Optional[ContractResponse]:
        """Get a contract by ID with its services"""
        try:
            # Get contract
            contract_response = self.db.table('contracts').select('*')\
                .eq('id', contract_id)\
                .execute()
            
            if not contract_response.data:
                return None

            contract_data = contract_response.data[0]
            
            # Get services
            services_response = self.db.table('services').select('*')\
                .eq('contract_id', contract_id)\
                .execute()
            
            contract_data['services'] = services_response.data or []
            
            return ContractResponse(**contract_data)
        except Exception as e:
            print(f"Error getting contract: {e}")
            raise

    async def get_company_contracts(self, company_id: str) -> List[ContractResponse]:
        """Get all contracts for a company"""
        try:
            contracts_response = self.db.table('contracts').select('*')\
                .eq('company_id', company_id)\
                .execute()
            
            if not contracts_response.data:
                return []

            contracts = []
            for contract_data in contracts_response.data:
                services_response = self.db.table('services').select('*')\
                    .eq('contract_id', contract_data['id'])\
                    .execute()
                
                contract_data['services'] = services_response.data or []
                contracts.append(ContractResponse(**contract_data))
            
            return contracts
        except Exception as e:
            print(f"Error getting company contracts: {e}")
            raise

    async def update_contract(
        self, 
        contract_id: str, 
        contract_update: ContractUpdate
    ) -> Optional[ContractResponse]:
        """Update a contract and its services"""
        try:
            update_data = {
                k: v for k, v in contract_update.model_dump(exclude={'services'}).items() 
                if v is not None
            }
            update_data['updated_at'] = datetime.utcnow()

            if update_data:
                contract_response = self.db.table('contracts').update(update_data)\
                    .eq('id', contract_id)\
                    .execute()
                
                if not contract_response.data:
                    return None

            # If services are provided, replace all existing services
            if contract_update.services is not None:
                # Delete existing services
                self.db.table('services').delete()\
                    .eq('contract_id', contract_id)\
                    .execute()
                
                # Create new services
                services_data = [
                    {**service.model_dump(), "contract_id": contract_id}
                    for service in contract_update.services
                ]
                
                self.db.table('services').insert(services_data)\
                    .execute()

            return await self.get_contract(contract_id)
        except Exception as e:
            print(f"Error updating contract: {e}")
            raise