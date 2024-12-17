from typing import Dict, List, Optional
from datetime import datetime, timedelta
from openai import OpenAI
from fastapi import UploadFile
import base64
from pydantic import BaseModel
from ..models.contract import LicenseType, PricingModel

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
    services: List[ServiceExtraction]
    renewal_date: Optional[str]
    review_date: Optional[str]
    contract_url: Optional[str]
    notes: Optional[str]
    contact_details: Optional[str]
    overall_total_cost: Optional[str]

class ContractProcessor:
    def __init__(self):
        self.client = OpenAI()
        self.system_prompt = """You're a SaaS contract parser that will ingest the PDF and automatically extract the values for a set of fields. 
        These fields either have pre-defined options that you have to match the data with or open text/string format where you place the right details."""
        
        self.user_prompt = """Please extract the following information and return it in a JSON format:
        1. App name: The product name
        2. Category: Match with [Identity & Access Management, HR & People, Finance & Operations, Development & DevOps, 
           Productivity & Collaboration, Sales & Marketing, Analytics & Customer Success, Security & Compliance, 
           Support & Service, Asset & Resource Management]
        3. Services: Array of services with:
           - Service name
           - License type [Monthly, Annual, Quarterly, Other]
           - Pricing model [Flat rated, Tiered, Pro-rated, Feature Based]
           - Cost per license
           - Number of licenses
           - Total cost
        4. Renewal date (DD/MM/YYYY)
        5. Review date (DD/MM/YYYY) - Two months before renewal
        6. Contract URL (if any)
        7. Notes/Comments - Leave blank if none
        8. Contact details - Leave blank if none
        9. Overall total cost (sum of all service costs)

        Return JSON only, no explanations."""

    async def _encode_pdf(self, file: UploadFile) -> str:
        """Convert PDF to base64"""
        content = await file.read()
        return base64.b64encode(content).decode('utf-8')

    async def process_contract(self, file: UploadFile) -> ContractExtraction:
        """Process contract PDF and extract information"""
        try:
            # Encode PDF
            base64_pdf = await self._encode_pdf(file)

            # Call GPT-4 Vision
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": self.user_prompt
                            },
                            {
                                "type": "image",
                                "image_url": {
                                    "url": f"data:application/pdf;base64,{base64_pdf}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=4096
            )

            # Parse response
            result = response.choices[0].message.content
            # Convert string response to ContractExtraction model
            extracted_data = ContractExtraction.model_validate_json(result)
            
            return extracted_data

        except Exception as e:
            print(f"Error processing contract: {e}")
            raise