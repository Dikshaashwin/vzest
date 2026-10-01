import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.misc import HomepageSection
from app.schemas.homepage import HomepageSectionOut, HomepageSectionUpdate
from app.security import require_staff

DEFAULT_SECTIONS = [
    {
        "key": "hero_banner",
        "title": "Hero Banner",
        "subtitle": 'Displays signature tagline "Pure provenance. Hand-tempered chocolate."',
        "position": 0,
    },
    {
        "key": "featured_collections",
        "title": "Featured Collections",
        "subtitle": "A 3-column series introducing the Single Origin, Infusion, and Atelier Truffle boxes.",
        "position": 1,
    },
    {
        "key": "brand_story",
        "title": "Brand Story",
        "subtitle": "Splits a narrative description of slow cast iron roasting beside a landscape photo.",
        "position": 2,
    },
    {
        "key": "newsletter_callout",
        "title": "Newsletter Callout",
        "subtitle": "Batch release subscription form with dynamic newsletter input fields.",
        "position": 3,
    },
]


router = APIRouter(prefix="/homepage-sections", tags=["homepage"])


@router.get("", response_model=list[HomepageSectionOut])
def list_active_sections(db: Session = Depends(get_db)):
    stmt = select(HomepageSection).where(HomepageSection.is_active.is_(True)).order_by(HomepageSection.position)
    return db.execute(stmt).scalars().all()


admin_router = APIRouter(prefix="/admin/homepage-sections", tags=["admin:homepage"], dependencies=[Depends(require_staff)])


@admin_router.get("", response_model=list[HomepageSectionOut])
def admin_list_sections(db: Session = Depends(get_db)):
    existing = db.execute(select(HomepageSection).order_by(HomepageSection.position)).scalars().all()
    if existing:
        return existing

    for section in DEFAULT_SECTIONS:
        db.add(HomepageSection(**section, is_active=True))
    db.commit()
    return db.execute(select(HomepageSection).order_by(HomepageSection.position)).scalars().all()


@admin_router.patch("/{section_id}/visibility", response_model=HomepageSectionOut)
def toggle_visibility(section_id: uuid.UUID, is_active: bool, db: Session = Depends(get_db)):
    section = db.get(HomepageSection, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    section.is_active = is_active
    db.commit()
    db.refresh(section)
    return section


@admin_router.patch("/{section_id}/content", response_model=HomepageSectionOut)
def update_content(section_id: uuid.UUID, payload: HomepageSectionUpdate, db: Session = Depends(get_db)):
    section = db.get(HomepageSection, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(section, key, value)
    db.commit()
    db.refresh(section)
    return section


@admin_router.patch("/{section_id}/position", response_model=HomepageSectionOut)
def move_position(section_id: uuid.UUID, direction: str, db: Session = Depends(get_db)):
    sections = db.execute(select(HomepageSection).order_by(HomepageSection.position)).scalars().all()
    index = next((i for i, s in enumerate(sections) if s.id == section_id), -1)
    swap_index = index - 1 if direction == "up" else index + 1
    if index == -1 or swap_index < 0 or swap_index >= len(sections):
        raise HTTPException(status_code=400, detail="Cannot move further in that direction")

    sections[index].position, sections[swap_index].position = sections[swap_index].position, sections[index].position
    db.commit()
    db.refresh(sections[index])
    return sections[index]
