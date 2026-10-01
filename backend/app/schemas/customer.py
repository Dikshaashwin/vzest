import uuid
from decimal import Decimal
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.order import AddressOut, OrderOut


class CustomerListItem(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime
    order_count: int
    total_spent: Decimal
    last_order_at: Optional[datetime] = None


class CustomerDetail(BaseModel):
    id: uuid.UUID
    name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    created_at: datetime
    addresses: list[AddressOut] = []
    orders: list[OrderOut] = []
