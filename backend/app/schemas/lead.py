import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class LeadInput(BaseModel):
    type: Literal["CONTACT", "CORPORATE_GIFTING"]
    name: str = Field(min_length=2)
    email: EmailStr
    phone: Optional[str] = None
    message: str = Field(min_length=5)


class LeadOut(ORMModel):
    id: uuid.UUID
    type: str
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    is_handled: bool
    created_at: datetime
