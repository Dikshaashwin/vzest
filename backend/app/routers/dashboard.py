from datetime import datetime, time, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models.enums import OrderStatus, Role
from app.models.order import Order, OrderItem
from app.models.catalog import ProductVariant
from app.models.user import Profile
from app.schemas.dashboard import DashboardOut, DashboardStats, TopProduct
from app.security import require_staff

router = APIRouter(prefix="/admin/dashboard", tags=["admin:dashboard"], dependencies=[Depends(require_staff)])


@router.get("", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db)):
    start_of_day = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc)

    today_orders = db.execute(select(func.count()).select_from(Order).where(Order.created_at >= start_of_day)).scalar_one()
    pending_orders = db.execute(
        select(func.count()).select_from(Order).where(Order.status.in_([OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.PROCESSING]))
    ).scalar_one()
    out_of_stock_count = db.execute(select(func.count()).select_from(ProductVariant).where(ProductVariant.stock == 0)).scalar_one()
    total_customers = db.execute(select(func.count()).select_from(Profile).where(Profile.role == Role.CUSTOMER)).scalar_one()
    revenue = db.execute(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.created_at >= start_of_day, Order.status != OrderStatus.PAYMENT_PENDING
        )
    ).scalar_one()

    low_stock_variants = db.execute(select(ProductVariant.stock, ProductVariant.low_stock_at).where(ProductVariant.stock > 0)).all()
    low_stock_count = sum(1 for stock, low_stock_at in low_stock_variants if stock <= low_stock_at)

    recent_orders = db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
        .limit(8)
        .options(selectinload(Order.items), selectinload(Order.payment), selectinload(Order.shipment))
    ).unique().scalars().all()

    top_products_rows = db.execute(
        select(OrderItem.product_id, OrderItem.name, func.sum(OrderItem.quantity).label("units"))
        .group_by(OrderItem.product_id, OrderItem.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
    ).all()

    return DashboardOut(
        stats=DashboardStats(
            today_revenue=Decimal(revenue),
            today_orders=today_orders,
            pending_orders=pending_orders,
            low_stock_count=low_stock_count,
            out_of_stock_count=out_of_stock_count,
            total_customers=total_customers,
        ),
        recent_orders=recent_orders,
        top_products=[TopProduct(product_id=str(pid), name=name, units_sold=units) for pid, name, units in top_products_rows],
    )
