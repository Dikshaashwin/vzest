import uuid

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models.enums import Role
from app.models.order import Order
from app.models.user import Address, Profile
from app.schemas.customer import CustomerDetail, CustomerListItem
from app.security import require_staff

router = APIRouter(prefix="/admin/customers", tags=["admin:customers"], dependencies=[Depends(require_staff)])


@router.get("", response_model=list[CustomerListItem])
def list_customers(db: Session = Depends(get_db)):
    stmt = (
        select(Profile)
        .where(Profile.role == Role.CUSTOMER)
        .options(selectinload(Profile.orders))
        .order_by(Profile.created_at.desc())
    )
    customers = db.execute(stmt).unique().scalars().all()

    result = []
    for c in customers:
        orders = sorted(c.orders, key=lambda o: o.created_at, reverse=True)
        result.append(
            CustomerListItem(
                id=c.id,
                name=c.name or "—",
                email=c.email,
                phone=c.phone,
                created_at=c.created_at,
                order_count=len(orders),
                total_spent=sum((o.total for o in orders), Decimal("0")),
                last_order_at=orders[0].created_at if orders else None,
            )
        )
    return result


@router.get("/{customer_id}", response_model=CustomerDetail)
def get_customer(customer_id: uuid.UUID, db: Session = Depends(get_db)):
    customer = db.get(
        Profile,
        customer_id,
        options=[
            selectinload(Profile.addresses),
            selectinload(Profile.orders).selectinload(Order.items),
            selectinload(Profile.orders).selectinload(Order.payment),
            selectinload(Profile.orders).selectinload(Order.shipment),
        ],
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.orders.sort(key=lambda o: o.created_at, reverse=True)
    return customer
