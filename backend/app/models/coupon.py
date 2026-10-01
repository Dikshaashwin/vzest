import uuid
from decimal import Decimal
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import TimestampMixin
from app.models.enums import CouponType


class Coupon(Base, TimestampMixin):
    __tablename__ = "coupons"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    type: Mapped[CouponType] = mapped_column(Enum(CouponType, name="coupon_type"))
    value: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    min_order_value: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    max_discount: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    usage_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    per_user_limit: Mapped[int] = mapped_column(Integer, default=1)
    starts_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    usages: Mapped[list["CouponUsage"]] = relationship(back_populates="coupon", cascade="all, delete-orphan")


class CouponUsage(Base, TimestampMixin):
    __tablename__ = "coupon_usages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coupon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("coupons.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))

    coupon: Mapped["Coupon"] = relationship(back_populates="usages")
