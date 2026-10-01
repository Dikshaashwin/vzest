import uuid
from decimal import Decimal
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

from app.schemas.common import ORMModel


class ProductSummaryOut(ORMModel):
    id: uuid.UUID
    name: str


class VariantWithProductOut(ORMModel):
    id: uuid.UUID
    sku: str
    label: str
    price: Decimal
    stock: int
    low_stock_at: int
    product: ProductSummaryOut


class InventoryTransactionOut(ORMModel):
    id: uuid.UUID
    change: int
    reason: str
    note: Optional[str] = None
    created_at: datetime


class StockAdjustmentInput(BaseModel):
    variant_id: uuid.UUID
    change: int
    reason: Literal["RESTOCK", "DAMAGED", "MANUAL_ADJUSTMENT"]
    note: Optional[str] = None
