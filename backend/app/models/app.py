from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from .base import BaseDBModel

class AppCategory(str, Enum):
    IDENTITY = "Identity & Access Management"
    HR = "HR & People"
    FINANCE = "Finance & Operations"
    DEVELOPMENT = "Development & DevOps"
    PRODUCTIVITY = "Productivity & Collaboration"
    SALES = "Sales & Marketing"
    ANALYTICS = "Analytics & Customer Success"
    SECURITY = "Security & Compliance"
    SUPPORT = "Support & Service"
    ASSET = "Asset & Resource Management"
    CSV = "CSV Uploads"

class AppBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: AppCategory
    is_predefined: bool = True
    api_supported: bool = False

class AppCreate(AppBase):
    pass

class AppResponse(AppBase, BaseDBModel):
    pass

class CompanyAppCreate(BaseModel):
    app_id: str
    company_id: str