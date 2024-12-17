from enum import Enum
from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field, field_validator
from .base import BaseDBModel

class LicenseType(str, Enum):
    MONTHLY = "Monthly"
    ANNUAL = "Annual"
    QUARTERLY = "Quarterly"
    OTHER = "Other"

class PricingModel(str, Enum):
    FLAT = "Flat rated"
    TIERED = "Tiered"
    PRORATED = "Pro-rated"
    FEATURE = "Feature based"

class ServiceBase(BaseModel):
    name: str = Field(..., min_length=1)
    license_type: LicenseType
    pricing_model: PricingModel
    cost_per_user: Optional[float] = Field(None, ge=0)
    number_of_licenses: Optional[int] = Field(None, ge=0)
    total_cost: Optional[float] = Field(None, ge=0)

    @field_validator('total_cost')
    def validate_total_cost(cls, v, values):
        cost = values.data.get('cost_per_user')
        licenses = values.data.get('number_of_licenses')
        if cost is not None and licenses is not None:
            calculated = cost * licenses
            if v is not None and abs(v - calculated) > 0.01:  # Allow small float difference
                raise ValueError('Total cost must match cost_per_user * number_of_licenses')
        return v

class ContractBase(BaseModel):
    app_id: str
    company_id: str
    renewal_date: Optional[date] = None
    review_date: Optional[date] = None
    overall_total_value: Optional[float] = Field(None, ge=0)
    contract_file_url: Optional[str] = None
    notes: Optional[str] = None
    contact_details: Optional[str] = None
    stitchflow_connection: str = "CSV Upload/API coming soon"

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase, BaseDBModel):
    contract_id: str

class ContractCreate(ContractBase):
    services: List[ServiceCreate]

class ContractUpdate(BaseModel):
    renewal_date: Optional[date] = None
    review_date: Optional[date] = None
    overall_total_value: Optional[float] = Field(None, ge=0)
    contract_file_url: Optional[str] = None
    notes: Optional[str] = None
    contact_details: Optional[str] = None
    services: Optional[List[ServiceCreate]] = None

class ContractResponse(ContractBase, BaseDBModel):
    services: List[ServiceResponse]