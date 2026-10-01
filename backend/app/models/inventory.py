import uuid
from typing import Optional

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import TimestampMixin
from app.models.enums import InventoryReason


class InventoryTransaction(Base, TimestampMixin):
    __tablename__ = "inventory_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    variant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product_variants.id", ondelete="CASCADE"))
    change: Mapped[int] = mapped_column(Integer)
    reason: Mapped[InventoryReason] = mapped_column(Enum(InventoryReason, name="inventory_reason"))
    note: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    order_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    variant: Mapped["ProductVariant"] = relationship()
