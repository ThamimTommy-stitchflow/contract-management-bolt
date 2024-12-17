from pydantic import BaseModel, Field, field_validator
from typing import Optional
from .base import BaseDBModel

class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    access_code: str = Field(..., min_length=4, max_length=4)

    @field_validator('access_code')
    def validate_access_code(cls, v):
        if not v.isalnum():
            raise ValueError('Access code must be alphanumeric')
        return v.upper()

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase, BaseDBModel):
    # Hide access_code in responses
    access_code: Optional[str] = None

class CompanyAuth(BaseModel):
    name: str
    access_code: str