import uuid
from decimal import Decimal
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class CouponOut(ORMModel):
    id: uuid.UUID
    code: str
    type: str
    value: Decimal
    min_order_value: Optional[Decimal] = None
    max_discount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    per_user_limit: int
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    is_active: bool
    usage_count: int = 0


class CouponInput(BaseModel):
    code: str = Field(min_length=3)
    type: Literal["PERCENTAGE", "FIXED"]
    value: Decimal = Field(gt=0)
    min_order_value: Optional[Decimal] = Field(default=None, ge=0)
    max_discount: Optional[Decimal] = Field(default=None, ge=0)
    usage_limit: Optional[int] = Field(default=None, ge=0)
    per_user_limit: int = Field(default=1, ge=1)
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    is_active: bool = True


class CouponValidateInput(BaseModel):
    code: str
    subtotal: Decimal


class CouponValidateOut(BaseModel):
    valid: bool
    code: Optional[str] = None
    discount: Decimal = Decimal("0")
    error: Optional[str] = None
