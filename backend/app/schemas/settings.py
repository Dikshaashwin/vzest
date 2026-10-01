from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ORMModel


class StoreSettingsOut(ORMModel):
    store_name: str
    domain: Optional[str] = None
    timezone: str
    currency: str
    contact_email: Optional[str] = None
    instagram_handle: Optional[str] = None


class StoreSettingsInput(BaseModel):
    store_name: str
    domain: Optional[str] = None
    timezone: str
    currency: str
    contact_email: Optional[str] = None
    instagram_handle: Optional[str] = None
