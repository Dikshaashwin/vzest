import uuid
from decimal import Decimal
from datetime import datetime
from typing import Optional

from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import TimestampMixin, UpdatedAtMixin
from app.models.enums import OrderStatus, PaymentStatus


class Order(Base, TimestampMixin, UpdatedAtMixin):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number: Mapped[str] = mapped_column(String, unique=True, index=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("profiles.id"), nullable=True)
    address_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("addresses.id"), nullable=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus, name="order_status"), default=OrderStatus.PAYMENT_PENDING)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    discount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0"))
    shipping_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0"))
    gst_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0"))
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    coupon_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    customer_name: Mapped[str] = mapped_column(String)
    customer_email: Mapped[str] = mapped_column(String)
    customer_phone: Mapped[str] = mapped_column(String)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Shipping address is snapshotted onto the order at checkout time — orders must not
    # change if the customer later edits or deletes a saved address.
    shipping_full_name: Mapped[str] = mapped_column(String)
    shipping_phone: Mapped[str] = mapped_column(String)
    shipping_line1: Mapped[str] = mapped_column(String)
    shipping_line2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    shipping_city: Mapped[str] = mapped_column(String)
    shipping_state: Mapped[str] = mapped_column(String)
    shipping_pincode: Mapped[str] = mapped_column(String)

    user: Mapped[Optional["Profile"]] = relationship(back_populates="orders")
    address: Mapped[Optional["Address"]] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    payment: Mapped[Optional["Payment"]] = relationship(back_populates="order", uselist=False, cascade="all, delete-orphan")
    shipment: Mapped[Optional["Shipment"]] = relationship(back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    variant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product_variants.id"))
    name: Mapped[str] = mapped_column(String)
    variant_label: Mapped[str] = mapped_column(String)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    quantity: Mapped[int] = mapped_column(Integer)

    order: Mapped["Order"] = relationship(back_populates="items")


class Payment(Base, TimestampMixin, UpdatedAtMixin):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), unique=True)
    provider: Mapped[str] = mapped_column(String, default="razorpay")
    razorpay_order_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    razorpay_signature: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus, name="payment_status"), default=PaymentStatus.PENDING)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    order: Mapped["Order"] = relationship(back_populates="payment")


class Shipment(Base, TimestampMixin, UpdatedAtMixin):
    __tablename__ = "shipments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), unique=True)
    provider: Mapped[str] = mapped_column(String, default="shiprocket")
    awb_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    courier_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tracking_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="PENDING")
    shipped_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    order: Mapped["Order"] = relationship(back_populates="shipment")
