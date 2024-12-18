from typing import Dict, List, Optional
from datetime import datetime, timedelta
from openai import OpenAI
from fastapi import UploadFile
import json
import asyncio
import time
from pydantic import BaseModel
from ..models.contract import LicenseType, PricingModel, ServiceCreate

class ServiceExtraction(BaseModel):
    name: str
    license_type: LicenseType
    pricing_model: PricingModel
    cost_per_license: str
    number_of_licenses: str
    total_cost: str

class ContractExtraction(BaseModel):
    app_name: str
    category: str
    services: List[ServiceCreate]
    renewal_date: Optional[str]
    review_date: Optional[str]
    contract_url: Optional[str] = None
    notes: Optional[str]
    contact_details: Optional[str]
    overall_total_cost: Optional[str]

class ContractProcessor:
    def __init__(self):
        self.client = OpenAI()
        
        self.system_prompt = """You're a SaaS contract parser that will extract key information from the PDF contract.
        Return the following information in JSON format:
        
        1. app_name: The product/software name
        2. category: One of [Identity & Access Management, HR & People, Finance & Operations, Development & DevOps, 
           Productivity & Collaboration, Sales & Marketing, Analytics & Customer Success, Security & Compliance, 
           Support & Service, Asset & Resource Management]
        3. services: Array of services with:
           - name: service name
           - license_type: one of [Monthly, Annual, Quarterly, Other]
           - pricing_model: one of [Flat rated, Tiered, Pro-rated, Feature based] (note: 'based' must be lowercase)
           - cost_per_license: cost as string number without currency
           - number_of_licenses: quantity as string
           - total_cost: total cost as string number without currency
        4. renewal_date: in DD/MM/YYYY format
        5. review_date: in DD/MM/YYYY format (two months before renewal)
        6. notes: any important notes or comments
        7. contact_details: any contact information
        8. overall_total_cost: total contract value as string number

        Return ONLY the JSON object, no additional text."""

    async def process_contract(self, file: UploadFile) -> ContractExtraction:
        """Process contract PDF using OpenAI's File Search capabilities"""
        try:
            if not file.content_type == 'application/pdf':
                raise ValueError("Only PDF files are supported")

            # Read the file content
            file_content = await file.read()
            
            # Create a vector store for this specific contract
            vector_store = self.client.beta.vector_stores.create(
                name=f"Contract_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )
            
            # Create a named temporary file with .pdf extension
            import tempfile
            import os
            
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            try:
                # Write content to temp file
                temp_file.write(file_content)
                temp_file.flush()
                
                # Reopen the file in binary read mode
                with open(temp_file.name, 'rb') as file_stream:
                    # Upload and process the file
                    file_batch = self.client.beta.vector_stores.file_batches.upload_and_poll(
                        vector_store_id=vector_store.id,
                        files=[file_stream]
                    )
                
                # Check file processing status
                if file_batch.status != 'completed':
                    raise ValueError(f"File processing failed with status: {file_batch.status}")
                    
            finally:
                # Clean up the temporary file
                temp_file.close()
                os.unlink(temp_file.name)

            # Create an assistant with file search capability
            assistant = self.client.beta.assistants.create(
                name="Contract Parser",
                instructions=self.system_prompt,
                model="gpt-4-turbo-preview",
                tools=[{"type": "file_search"}],
                tool_resources={
                    "file_search": {
                        "vector_store_ids": [vector_store.id]
                    }
                }
            )

            # Create a thread
            thread = self.client.beta.threads.create()

            # Add a message to the thread
            self.client.beta.threads.messages.create(
                thread_id=thread.id,
                role="user",
                content="Please analyze this contract and extract all the requested information in JSON format."
            )

            # Create and run the analysis
            run = self.client.beta.threads.runs.create(
                thread_id=thread.id,
                assistant_id=assistant.id
            )

            # Wait for completion
            max_retries = 60  # Maximum 60 seconds wait
            retries = 0
            while True:
                run_status = self.client.beta.threads.runs.retrieve(
                    thread_id=thread.id,
                    run_id=run.id
                )
                print(f"Run status: {run_status.status}")
                
                if run_status.status == 'completed':
                    break
                elif run_status.status in ['failed', 'cancelled', 'expired']:
                    raise ValueError(f"Assistant run failed with status: {run_status.status}")
                
                retries += 1
                if retries >= max_retries:
                    raise ValueError("Assistant run timed out after 60 seconds")
                    
                await asyncio.sleep(1)

            # Get the response
            messages = self.client.beta.threads.messages.list(
                thread_id=thread.id,
                order='desc',
                limit=1
            )
            
            # Extract JSON from the response
            response_text = messages.data[0].content[0].text.value
            try:
                parsed_data = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON if response contains additional text
                import re
                json_match = re.search(r'\{[\s\S]*\}', response_text)
                if json_match:
                    parsed_data = json.loads(json_match.group())
                else:
                    raise ValueError("Failed to parse response as JSON")

            # Clean up
            try:
                await self.cleanup_resources(vector_store.id, assistant.id)
            except Exception as e:
                print(f"Cleanup error (non-critical): {e}")

            # Convert services to ServiceCreate objects
            services = []
            # Mapping for pricing model normalization
            pricing_model_mapping = {
                'FLAT RATED': 'Flat rated',
                'TIERED': 'Tiered',
                'PRO-RATED': 'Pro-rated',
                'FEATURE BASED': 'Feature based'
            }
            
            for service in parsed_data.get('services', []):
                # Normalize the pricing model
                pricing_model = service['pricing_model'].upper()
                normalized_pricing_model = pricing_model_mapping.get(pricing_model, service['pricing_model'])
                
                try:
                    services.append(ServiceCreate(
                        name=service['name'],
                        license_type=service['license_type'],
                        pricing_model=normalized_pricing_model,
                        cost_per_user=service['cost_per_license'],
                        number_of_licenses=service['number_of_licenses'],
                        total_cost=float(service['total_cost'])
                    ))
                except ValueError as e:
                    print(f"Error processing service {service['name']}: {str(e)}")
                    print(f"Pricing model received: {service['pricing_model']}")
                    print(f"Normalized pricing model: {normalized_pricing_model}")
                    raise

            # Process contact details to string
            contact_details = None
            if isinstance(parsed_data.get('contact_details'), dict):
                contact_items = []
                for k, v in parsed_data['contact_details'].items():
                    key = k.replace('_', ' ').title()
                    contact_items.append(f"{key}: {v}")
                contact_details = "\n".join(contact_items)
            else:
                contact_details = parsed_data.get('contact_details')

            # Create and return ContractExtraction object
            return ContractExtraction(
                app_name=parsed_data['app_name'],
                category=parsed_data['category'],
                services=services,
                renewal_date=parsed_data.get('renewal_date'),
                review_date=parsed_data.get('review_date'),
                contract_url=None,
                notes=parsed_data.get('notes'),
                contact_details=contact_details,
                overall_total_cost=parsed_data.get('overall_total_cost')
            )

        except Exception as e:
            print(f"Error processing contract: {str(e)}")
            raise ValueError(f"Failed to process contract: {str(e)}")

    async def cleanup_resources(self, vector_store_id: str, assistant_id: str):
        """Clean up OpenAI resources after processing"""
        try:
            # Delete the vector store (this will also clean up associated files)
            self.client.beta.vector_stores.delete(vector_store_id)
            
            # Delete the assistant
            self.client.beta.assistants.delete(assistant_id)
        except Exception as e:
            print(f"Error during cleanup: {str(e)}")