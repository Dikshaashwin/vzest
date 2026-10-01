import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.coupon import Coupon, CouponUsage
from app.schemas.coupon import CouponInput, CouponOut, CouponValidateInput, CouponValidateOut
from app.security import require_staff
from app.services.coupons import validate_coupon

router = APIRouter(tags=["coupons"])


@router.post("/coupons/validate", response_model=CouponValidateOut)
def validate(payload: CouponValidateInput, db: Session = Depends(get_db)):
    result = validate_coupon(db, payload.code, payload.subtotal)
    return CouponValidateOut(valid=result.valid, code=result.code, discount=result.discount, error=result.error)


admin_router = APIRouter(prefix="/admin/coupons", tags=["admin:coupons"], dependencies=[Depends(require_staff)])


@admin_router.get("", response_model=list[CouponOut])
def admin_list_coupons(db: Session = Depends(get_db)):
    usage_counts = dict(db.execute(select(CouponUsage.coupon_id, func.count()).group_by(CouponUsage.coupon_id)).all())
    coupons = db.execute(select(Coupon).order_by(Coupon.created_at.desc())).scalars().all()
    return [CouponOut(**CouponOut.model_validate(c).model_dump(), usage_count=usage_counts.get(c.id, 0)) for c in coupons]


@admin_router.post("", response_model=CouponOut, status_code=201)
def create_coupon(payload: CouponInput, db: Session = Depends(get_db)):
    coupon = Coupon(**{**payload.model_dump(), "code": payload.code.upper()})
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@admin_router.patch("/{coupon_id}/active", response_model=CouponOut)
def toggle_coupon_active(coupon_id: uuid.UUID, is_active: bool, db: Session = Depends(get_db)):
    coupon = db.get(Coupon, coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    coupon.is_active = is_active
    db.commit()
    db.refresh(coupon)
    return coupon


@admin_router.delete("/{coupon_id}", status_code=204)
def delete_coupon(coupon_id: uuid.UUID, db: Session = Depends(get_db)):
    coupon = db.get(Coupon, coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
