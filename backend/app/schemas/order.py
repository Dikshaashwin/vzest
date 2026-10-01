import uuid
from decimal import Decimal
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class AddressInput(BaseModel):
    full_name: str = Field(min_length=2)
    phone: str = Field(min_length=10, max_length=15)
    line1: str = Field(min_length=3)
    line2: Optional[str] = None
    city: str = Field(min_length=2)
    state: str = Field(min_length=2)
    pincode: str = Field(min_length=4, max_length=10)


class AddressOut(ORMModel):
    id: uuid.UUID
    full_name: str
    phone: str
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str
    is_default: bool


class CheckoutItem(BaseModel):
    product_id: uuid.UUID
    variant_id: uuid.UUID
    quantity: int = Field(gt=0)


class CheckoutInput(BaseModel):
    address: AddressInput
    coupon_code: Optional[str] = None
    shipping_method: Literal["standard", "express"] = "standard"
    items: list[CheckoutItem] = Field(min_length=1)
    customer_name: str = Field(min_length=2)
    customer_email: EmailStr
    customer_phone: str = Field(min_length=10, max_length=15)


class CheckoutResponse(BaseModel):
    order_id: uuid.UUID
    order_number: str
    razorpay_order_id: Optional[str] = None
    amount: int
    currency: str = "INR"
    key_id: Optional[str] = None


class VerifyPaymentInput(BaseModel):
    order_id: uuid.UUID
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class OrderItemOut(ORMModel):
    id: uuid.UUID
    name: str
    variant_label: str
    price: Decimal
    quantity: int


class PaymentOut(ORMModel):
    provider: str
    status: str
    razorpay_payment_id: Optional[str] = None


class ShipmentOut(ORMModel):
    provider: str
    awb_code: Optional[str] = None
    courier_name: Optional[str] = None
    status: str


class OrderOut(ORMModel):
    id: uuid.UUID
    order_number: str
    status: str
    subtotal: Decimal
    discount: Decimal
    shipping_fee: Decimal
    gst_amount: Decimal
    total: Decimal
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_full_name: str
    shipping_phone: str
    shipping_line1: str
    shipping_line2: Optional[str] = None
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    created_at: datetime
    items: list[OrderItemOut] = []
    payment: Optional[PaymentOut] = None
    shipment: Optional[ShipmentOut] = None


class OrderStatusUpdate(BaseModel):
    status: Literal[
        "PAYMENT_PENDING",
        "PAID",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "READY_TO_SHIP",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
        "REFUNDED",
    ]


class OrderTrackInput(BaseModel):
    order_number: str
    email: EmailStr
