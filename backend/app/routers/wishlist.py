import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models.catalog import Product, WishlistItem
from app.models.user import Profile
from app.schemas.wishlist import WishlistItemOut
from app.security import get_current_user

router = APIRouter(prefix="/account/wishlist", tags=["wishlist"])


@router.get("", response_model=list[WishlistItemOut])
def list_wishlist(db: Session = Depends(get_db), user: Profile = Depends(get_current_user)):
    stmt = (
        select(WishlistItem)
        .where(WishlistItem.user_id == user.id)
        .options(
            selectinload(WishlistItem.product).selectinload(Product.images),
            selectinload(WishlistItem.product).selectinload(Product.variants),
        )
        .order_by(WishlistItem.created_at.desc())
    )
    return db.execute(stmt).scalars().all()


@router.post("/{product_id}/toggle", status_code=200)
def toggle_wishlist(product_id: uuid.UUID, db: Session = Depends(get_db), user: Profile = Depends(get_current_user)):
    existing = db.execute(
        select(WishlistItem).where(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id)
    ).scalar_one_or_none()

    if existing:
        db.delete(existing)
        db.commit()
        return {"wishlisted": False}

    db.add(WishlistItem(user_id=user.id, product_id=product_id))
    db.commit()
    return {"wishlisted": True}


@router.delete("/{wishlist_item_id}", status_code=204)
def remove_wishlist_item(wishlist_item_id: uuid.UUID, db: Session = Depends(get_db), user: Profile = Depends(get_current_user)):
    item = db.get(WishlistItem, wishlist_item_id)
    if item and item.user_id == user.id:
        db.delete(item)
        db.commit()
