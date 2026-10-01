import uuid
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class CollectionOut(ORMModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: bool


class CollectionAdminOut(CollectionOut):
    product_count: int = 0


class CollectionInput(BaseModel):
    name: str = Field(min_length=2)
    slug: str = Field(min_length=2)
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: bool = False
