import uuid
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMModel


class MeOut(ORMModel):
    id: uuid.UUID
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    role: str


class UpdateMeInput(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
