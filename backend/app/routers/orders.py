import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.db import get_db
from app.models.enums import InventoryReason, OrderStatus, PaymentStatus
from app.models.order import Order, OrderItem, Payment
from app.models.user import Profile
from app.schemas.order import (
    CheckoutInput,
    CheckoutResponse,
    OrderOut,
    OrderStatusUpdate,
    OrderTrackInput,
    VerifyPaymentInput,
)
from app.security import get_current_user, get_current_user_optional, require_staff
from app.services.inventory import record_inventory_movement
from app.services.order_number import generate_order_number
from app.services.order_pricing import OutOfStockError, price_cart
from app.services.razorpay_client import create_razorpay_order, verify_payment_signature, verify_webhook_signature

settings = get_settings()
router = APIRouter(tags=["orders"])

ORDER_LOAD_OPTS = (selectinload(Order.items), selectinload(Order.payment), selectinload(Order.shipment))


@router.post("/checkout", response_model=CheckoutResponse)
def checkout(
    payload: CheckoutInput,
    db: Session = Depends(get_db),
    user: Profile | None = Depends(get_current_user_optional),
):
    try:
        pricing = price_cart(
            db,
            [item.model_dump() for item in payload.items],
            payload.coupon_code,
            payload.shipping_method,
        )
    except OutOfStockError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    order = Order(
        order_number=generate_order_number(),
        user_id=user.id if user else None,
        status=OrderStatus.PAYMENT_PENDING,
        subtotal=pricing.subtotal,
        discount=pricing.discount,
        shipping_fee=pricing.shipping_fee,
        gst_amount=pricing.gst_amount,
        total=pricing.total,
        coupon_code=pricing.coupon_code,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_phone=payload.customer_phone,
        shipping_full_name=payload.address.full_name,
        shipping_phone=payload.address.phone,
        shipping_line1=payload.address.line1,
        shipping_line2=payload.address.line2,
        shipping_city=payload.address.city,
        shipping_state=payload.address.state,
        shipping_pincode=payload.address.pincode,
        items=[
            OrderItem(
                product_id=li.product.id,
                variant_id=li.variant.id,
                name=li.product.name,
                variant_label=li.variant.label,
                price=li.variant.price,
                quantity=li.quantity,
            )
            for li in pricing.line_items
        ],
        payment=Payment(amount=pricing.total, status=PaymentStatus.PENDING),
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    amount_in_paise = int(pricing.total * 100)
    razorpay_order_id = None
    key_id = settings.razorpay_key_id or None
    if key_id:
        try:
            rp_order = create_razorpay_order(amount_in_paise, order.order_number)
            razorpay_order_id = rp_order["id"]
        except Exception:
            key_id = None  # fall through: order stays PAYMENT_PENDING, frontend shows a "not configured" message

    return CheckoutResponse(
        order_id=order.id,
        order_number=order.order_number,
        razorpay_order_id=razorpay_order_id,
        amount=amount_in_paise,
        key_id=key_id,
    )


@router.post("/checkout/verify")
def verify_payment(payload: VerifyPaymentInput, db: Session = Depends(get_db)):
    if not verify_payment_signature(payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")

    order = db.get(Order, payload.order_id, options=list(ORDER_LOAD_OPTS))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    if order.payment and order.payment.status != PaymentStatus.PAID:
        _mark_order_paid(db, order, payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature)
    return {"success": True, "order_number": order.order_number}


@router.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    raw_body = await request.body()
    signature = request.headers.get("x-razorpay-signature")
    if not signature or not verify_webhook_signature(raw_body, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    event = await request.json()
    if event.get("event") == "payment.captured":
        payment_entity = event["payload"]["payment"]["entity"]
        razorpay_order_id = payment_entity["order_id"]

        payment = db.execute(select(Payment).where(Payment.razorpay_order_id == razorpay_order_id)).scalar_one_or_none()
        if payment and payment.status != PaymentStatus.PAID:
            order = db.get(Order, payment.order_id, options=list(ORDER_LOAD_OPTS))
            _mark_order_paid(db, order, razorpay_order_id, payment_entity["id"], signature)

    return {"received": True}


def _mark_order_paid(db: Session, order: Order, rp_order_id: str, rp_payment_id: str, rp_signature: str) -> None:
    order.status = OrderStatus.CONFIRMED
    if order.payment:
        order.payment.status = PaymentStatus.PAID
        order.payment.razorpay_order_id = rp_order_id
        order.payment.razorpay_payment_id = rp_payment_id
        order.payment.razorpay_signature = rp_signature

    for item in order.items:
        record_inventory_movement(db, item.variant_id, -item.quantity, InventoryReason.ORDER_PLACED, order_id=order.id)

    db.commit()

    try:
        from app.services.email import send_order_confirmation_email

        send_order_confirmation_email(order.customer_email, order.order_number, f"₹{order.total}")
    except Exception:
        pass  # email delivery is best-effort; never fail the payment flow over it


@router.post("/orders/track", response_model=OrderOut)
def track_order(payload: OrderTrackInput, db: Session = Depends(get_db)):
    stmt = select(Order).where(Order.order_number == payload.order_number.strip().upper()).options(*ORDER_LOAD_OPTS)
    order = db.execute(stmt).scalar_one_or_none()
    if not order or order.customer_email.lower() != payload.email.lower():
        raise HTTPException(status_code=404, detail="No matching order found.")
    return order


# ---------- Customer account ----------

@router.get("/account/orders", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), user: Profile = Depends(get_current_user)):
    stmt = select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc()).options(*ORDER_LOAD_OPTS)
    return db.execute(stmt).unique().scalars().all()


@router.get("/account/orders/{order_id}", response_model=OrderOut)
def my_order_detail(order_id: uuid.UUID, db: Session = Depends(get_db), user: Profile = Depends(get_current_user)):
    order = db.get(Order, order_id, options=list(ORDER_LOAD_OPTS))
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Order not found.")
    return order


# ---------- Admin ----------

admin_router = APIRouter(prefix="/admin/orders", tags=["admin:orders"], dependencies=[Depends(require_staff)])


@admin_router.get("", response_model=list[OrderOut])
def admin_list_orders(status: OrderStatus | None = None, db: Session = Depends(get_db)):
    stmt = select(Order).options(*ORDER_LOAD_OPTS).order_by(Order.created_at.desc())
    if status:
        stmt = stmt.where(Order.status == status)
    return db.execute(stmt).unique().scalars().all()


@admin_router.get("/{order_id}", response_model=OrderOut)
def admin_get_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = db.get(Order, order_id, options=list(ORDER_LOAD_OPTS))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return order


@admin_router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: uuid.UUID, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.get(Order, order_id, options=list(ORDER_LOAD_OPTS))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    new_status = OrderStatus(payload.status)
    if new_status in (OrderStatus.CANCELLED, OrderStatus.RETURNED):
        reason = InventoryReason.ORDER_CANCELLED if new_status == OrderStatus.CANCELLED else InventoryReason.RETURN_RESTOCK
        for item in order.items:
            record_inventory_movement(db, item.variant_id, item.quantity, reason, order_id=order.id)

    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
