from enum import Enum
from typing import Optional, List
from datetime import date, datetime
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
    stitchflow_connection: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def validate_dates(cls, values):
        for date_field in ['renewal_date', 'review_date']:
            if isinstance(values.get(date_field), str):
                try:
                    # First try ISO format
                    values[date_field] = date.fromisoformat(values[date_field])
                except ValueError:
                    try:
                        # Then try DD/MM/YYYY format
                        date_obj = datetime.strptime(values[date_field], '%d/%m/%Y')
                        values[date_field] = date_obj.date()
                    except ValueError:
                        raise ValueError(f"Invalid date format for {date_field}. Use YYYY-MM-DD or DD/MM/YYYY")
        return values

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        # Convert dates to ISO format strings only if they are date objects
        if data.get('renewal_date') and not isinstance(data['renewal_date'], str):
            data['renewal_date'] = data['renewal_date'].isoformat()
        if data.get('review_date') and not isinstance(data['review_date'], str):
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
    contract_file_url: Optional[str] = None
    renewal_date: Optional[date] = None
    review_date: Optional[date] = None
    notes: Optional[str] = None
    contact_details: Optional[dict] = None
    overall_total_value: Optional[float] = None
    stitchflow_connection: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def validate_dates(cls, values):
        for date_field in ['renewal_date', 'review_date']:
            if isinstance(values.get(date_field), str):
                try:
                    # First try ISO format
                    values[date_field] = date.fromisoformat(values[date_field])
                except ValueError:
                    try:
                        # Then try DD/MM/YYYY format
                        date_obj = datetime.strptime(values[date_field], '%d/%m/%Y')
                        values[date_field] = date_obj.date()
                    except ValueError:
                        raise ValueError(f"Invalid date format for {date_field}. Use YYYY-MM-DD or DD/MM/YYYY")
        return values

    class Config:
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }

class ContractResponse(ContractBase, BaseDBModel):
    services: List[ServiceResponse]