from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class BaseDBModel(BaseModel):
    id: str = Field(default_factory=lambda: None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True