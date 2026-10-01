import uuid
from typing import Optional

from sqlalchemy import Boolean, Enum, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base
from app.models.base import TimestampMixin, UpdatedAtMixin
from app.models.enums import LeadType


class HomepageSection(Base, UpdatedAtMixin):
    __tablename__ = "homepage_sections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    subtitle: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    link_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ref_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Lead(Base, TimestampMixin):
    __tablename__ = "leads"
    __table_args__ = (UniqueConstraint("email", "type", name="uq_lead_email_type"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type: Mapped[LeadType] = mapped_column(Enum(LeadType, name="lead_type"))
    name: Mapped[str] = mapped_column(String, default="")
    email: Mapped[str] = mapped_column(String, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    message: Mapped[str] = mapped_column(String, default="")
    is_handled: Mapped[bool] = mapped_column(Boolean, default=False)


class StoreSettings(Base, UpdatedAtMixin):
    __tablename__ = "store_settings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default="singleton")
    store_name: Mapped[str] = mapped_column(String, default="Zest Chocolates Ltd.")
    domain: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    timezone: Mapped[str] = mapped_column(String, default="Europe/Paris")
    currency: Mapped[str] = mapped_column(String, default="USD")
    contact_email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    instagram_handle: Mapped[Optional[str]] = mapped_column(String, nullable=True)
