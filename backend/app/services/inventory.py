import uuid

from sqlalchemy.orm import Session

from app.models.catalog import ProductVariant
from app.models.enums import InventoryReason
from app.models.inventory import InventoryTransaction


def record_inventory_movement(
    db: Session,
    variant_id: uuid.UUID,
    change: int,
    reason: InventoryReason,
    order_id: uuid.UUID | None = None,
    note: str | None = None,
) -> None:
    """Applies a stock delta and writes the audit-log entry in the same transaction.

    Callers commit; this only stages the changes so it composes with order creation
    and other multi-step flows without partial writes.
    """
    variant = db.get(ProductVariant, variant_id)
    if variant is None:
        raise ValueError("Product variant not found")

    variant.stock += change
    db.add(InventoryTransaction(variant_id=variant_id, change=change, reason=reason, order_id=order_id, note=note))
