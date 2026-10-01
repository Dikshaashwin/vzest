import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import Address, Profile
from app.schemas.order import AddressInput, AddressOut
from app.security import get_current_user

router = APIRouter(prefix="/account/addresses", tags=["addresses"])


@router.get("", response_model=list[AddressOut])
def list_addresses(db: Session = Depends(get_db), user: Profile = Depends(get_current_user)):
    stmt = select(Address).where(Address.user_id == user.id).order_by(Address.is_default.desc())
    return db.execute(stmt).scalars().all()


@router.post("", response_model=AddressOut, status_code=201)
def create_address(
    payload: AddressInput,
    is_default: bool = False,
    db: Session = Depends(get_db),
    user: Profile = Depends(get_current_user),
):
    if is_default:
        for addr in db.execute(select(Address).where(Address.user_id == user.id)).scalars():
            addr.is_default = False

    address = Address(user_id=user.id, is_default=is_default, **payload.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}", status_code=204)
def delete_address(address_id: uuid.UUID, db: Session = Depends(get_db), user: Profile = Depends(get_current_user)):
    address = db.get(Address, address_id)
    if address and address.user_id == user.id:
        db.delete(address)
        db.commit()


@router.patch("/{address_id}/default", response_model=AddressOut)
def set_default_address(address_id: uuid.UUID, db: Session = Depends(get_db), user: Profile = Depends(get_current_user)):
    address = db.get(Address, address_id)
    if not address or address.user_id != user.id:
        raise HTTPException(status_code=404, detail="Address not found")

    for addr in db.execute(select(Address).where(Address.user_id == user.id)).scalars():
        addr.is_default = addr.id == address_id

    db.commit()
    db.refresh(address)
    return address
