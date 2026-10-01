from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.coupon import Coupon


@dataclass
class CouponResult:
    valid: bool
    code: str | None = None
    discount: Decimal = Decimal("0")
    error: str | None = None


def validate_coupon(db: Session, code: str, subtotal: Decimal) -> CouponResult:
    coupon = db.execute(select(Coupon).where(Coupon.code == code.strip().upper())).scalar_one_or_none()
    if not coupon or not coupon.is_active:
        return CouponResult(valid=False, error="Invalid or expired coupon code.")

    now = datetime.now(timezone.utc)
    if coupon.starts_at and now < coupon.starts_at:
        return CouponResult(valid=False, error="This coupon is not active yet.")
    if coupon.ends_at and now > coupon.ends_at:
        return CouponResult(valid=False, error="This coupon has expired.")
    if coupon.min_order_value and subtotal < coupon.min_order_value:
        return CouponResult(valid=False, error=f"Minimum order value is ₹{coupon.min_order_value}.")

    discount = (subtotal * coupon.value / Decimal("100")) if coupon.type.value == "PERCENTAGE" else coupon.value
    if coupon.max_discount:
        discount = min(discount, coupon.max_discount)

    return CouponResult(valid=True, code=coupon.code, discount=discount)
