from enum import Enum
from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field, field_validator, model_validator
from .base import BaseDBModel
import json

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
    def calculate_total_cost(cls, v, values):
        cost = values.data.get('cost_per_user')
        licenses = values.data.get('number_of_licenses')
        if cost is not None and licenses is not None:
            expected = cost * licenses
            if v is not None and abs(v - expected) > 0.01:
                v = expected
        return v

class ContractBase(BaseModel):
    company_id: str
    app_id: str 
    renewal_date: Optional[date] = None
    review_date: Optional[date] = None
    overall_total_value: Optional[float] = Field(None, ge=0)
    contract_file_url: Optional[str] = None
    notes: Optional[str] = None
    contact_details: Optional[str] = None
    stitchflow_connection: str = "CSV Upload/API coming soon"
    contract_file_url: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def validate_dates(cls, values):
        # Convert string dates to date objects if they're strings
        if isinstance(values.get('renewal_date'), str):
            values['renewal_date'] = date.fromisoformat(values['renewal_date'])
        if isinstance(values.get('review_date'), str):
            values['review_date'] = date.fromisoformat(values['review_date'])
        return values

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        # Convert dates to ISO format strings
        if data.get('renewal_date'):
            data['renewal_date'] = data['renewal_date'].isoformat()
        if data.get('review_date'):
            data['review_date'] = data['review_date'].isoformat()
        return data

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
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