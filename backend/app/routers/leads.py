import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.enums import LeadType
from app.models.misc import Lead
from app.schemas.lead import LeadInput, LeadOut
from app.security import require_staff

router = APIRouter(tags=["leads"])


@router.post("/leads", status_code=201)
def submit_lead(payload: LeadInput, db: Session = Depends(get_db)):
    db.add(Lead(**payload.model_dump()))
    db.commit()
    return {"success": True}


class NewsletterInput(BaseModel):
    email: EmailStr


@router.post("/newsletter", status_code=201)
def subscribe_newsletter(payload: NewsletterInput, db: Session = Depends(get_db)):
    stmt = (
        insert(Lead)
        .values(type=LeadType.NEWSLETTER, email=payload.email)
        .on_conflict_do_nothing(index_elements=["email", "type"])
    )
    db.execute(stmt)
    db.commit()
    return {"success": True}


admin_router = APIRouter(prefix="/admin/leads", tags=["admin:leads"], dependencies=[Depends(require_staff)])


@admin_router.get("", response_model=list[LeadOut])
def list_leads(db: Session = Depends(get_db)):
    return db.execute(select(Lead).order_by(Lead.created_at.desc())).scalars().all()


@admin_router.patch("/{lead_id}/handled", response_model=LeadOut)
def mark_lead_handled(lead_id: uuid.UUID, is_handled: bool, db: Session = Depends(get_db)):
    lead = db.get(Lead, lead_id)
    if lead:
        lead.is_handled = is_handled
        db.commit()
        db.refresh(lead)
    return lead
