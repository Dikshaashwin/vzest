from dataclasses import dataclass
from decimal import Decimal
from typing import Literal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.catalog import Product, ProductVariant
from app.services.coupons import validate_coupon

SHIPPING_FLAT_FEE = Decimal("80")
FREE_SHIPPING_THRESHOLD = Decimal("999")
EXPRESS_SHIPPING_FEE = Decimal("250")


@dataclass
class LineItem:
    product: Product
    variant: ProductVariant
    quantity: int
    line_total: Decimal


@dataclass
class CartPricing:
    line_items: list[LineItem]
    subtotal: Decimal
    discount: Decimal
    shipping_fee: Decimal
    gst_amount: Decimal
    total: Decimal
    coupon_code: str | None


class OutOfStockError(Exception):
    pass


def price_cart(
    db: Session,
    items: list[dict],
    coupon_code: str | None,
    shipping_method: Literal["standard", "express"],
) -> CartPricing:
    variant_ids = [item["variant_id"] for item in items]
    stmt = select(ProductVariant).where(ProductVariant.id.in_(variant_ids)).options(selectinload(ProductVariant.product))
    variants_by_id = {v.id: v for v in db.execute(stmt).scalars().all()}

    subtotal = Decimal("0")
    line_items: list[LineItem] = []
    for item in items:
        variant = variants_by_id.get(item["variant_id"])
        if not variant:
            raise ValueError("Product variant not found.")
        if variant.stock < item["quantity"]:
            raise OutOfStockError(f"{variant.product.name} ({variant.label}) is out of stock.")
        line_total = variant.price * item["quantity"]
        subtotal += line_total
        line_items.append(LineItem(product=variant.product, variant=variant, quantity=item["quantity"], line_total=line_total))

    discount = Decimal("0")
    applied_code = None
    if coupon_code:
        result = validate_coupon(db, coupon_code, subtotal)
        if result.valid:
            discount = result.discount
            applied_code = result.code

    if shipping_method == "express":
        shipping_fee = EXPRESS_SHIPPING_FEE
    else:
        shipping_fee = Decimal("0") if subtotal - discount >= FREE_SHIPPING_THRESHOLD else SHIPPING_FLAT_FEE

    gst_amount = sum((li.line_total * li.variant.gst_percent / Decimal("100") for li in line_items), Decimal("0"))
    total = subtotal - discount + shipping_fee + gst_amount

    return CartPricing(
        line_items=line_items,
        subtotal=subtotal,
        discount=discount,
        shipping_fee=shipping_fee,
        gst_amount=gst_amount,
        total=total,
        coupon_code=applied_code,
    )
