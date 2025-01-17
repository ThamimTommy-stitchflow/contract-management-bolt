from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field
from .base import BaseDBModel
from .contract import ContractResponse

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
    name: str
    category: str
    is_predefined: bool = False
    api_supported: Optional[bool] = False

class AppCreate(AppBase):
    pass

class AppResponse(AppBase):
    id: str

class CompanyAppCreate(BaseModel):
    company_id: str
    app_id: str

class CompanyAppWithContractResponse(AppResponse):
    contract: Optional[ContractResponse] = None