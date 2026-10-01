import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models.catalog import ProductVariant
from app.models.inventory import InventoryTransaction
from app.schemas.inventory import (
    InventoryTransactionOut,
    StockAdjustmentInput,
    VariantWithProductOut,
)
from app.security import require_staff
from app.services.inventory import record_inventory_movement

router = APIRouter(prefix="/admin/inventory", tags=["admin:inventory"], dependencies=[Depends(require_staff)])


@router.get("", response_model=list[VariantWithProductOut])
def list_inventory(db: Session = Depends(get_db)):
    stmt = select(ProductVariant).options(selectinload(ProductVariant.product)).order_by(ProductVariant.stock.asc())
    return db.execute(stmt).scalars().all()


@router.get("/{variant_id}/history", response_model=list[InventoryTransactionOut])
def inventory_history(variant_id: uuid.UUID, db: Session = Depends(get_db)):
    stmt = (
        select(InventoryTransaction)
        .where(InventoryTransaction.variant_id == variant_id)
        .order_by(InventoryTransaction.created_at.desc())
        .limit(50)
    )
    return db.execute(stmt).scalars().all()


@router.post("/adjust", status_code=204)
def adjust_stock(payload: StockAdjustmentInput, db: Session = Depends(get_db)):
    record_inventory_movement(db, payload.variant_id, payload.change, payload.reason, note=payload.note)
    db.commit()
