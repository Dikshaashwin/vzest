import uuid
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMModel


class HomepageSectionOut(ORMModel):
    id: uuid.UUID
    key: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    position: int
    is_active: bool


class HomepageSectionUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
