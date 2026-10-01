import uuid
from typing import Optional

from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.base import TimestampMixin, UpdatedAtMixin
from app.models.enums import Role


class Profile(Base, TimestampMixin, UpdatedAtMixin):
    """Application-level profile for a Supabase Auth user (auth.users.id == profiles.id)."""

    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    role: Mapped[Role] = mapped_column(Enum(Role, name="role"), default=Role.CUSTOMER)

    addresses: Mapped[list["Address"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    wishlist: Mapped[list["WishlistItem"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Address(Base, TimestampMixin):
    __tablename__ = "addresses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    full_name: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    line1: Mapped[str] = mapped_column(String)
    line2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    city: Mapped[str] = mapped_column(String)
    state: Mapped[str] = mapped_column(String)
    pincode: Mapped[str] = mapped_column(String)
    country: Mapped[str] = mapped_column(String, default="India")
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["Profile"] = relationship(back_populates="addresses")
    orders: Mapped[list["Order"]] = relationship(back_populates="address")
