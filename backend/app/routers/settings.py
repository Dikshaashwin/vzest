from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.misc import StoreSettings
from app.schemas.settings import StoreSettingsInput, StoreSettingsOut
from app.security import require_staff

router = APIRouter(prefix="/admin/settings", tags=["admin:settings"], dependencies=[Depends(require_staff)])


def _get_or_create(db: Session) -> StoreSettings:
    settings = db.get(StoreSettings, "singleton")
    if not settings:
        settings = StoreSettings(id="singleton")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=StoreSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return _get_or_create(db)


@router.put("", response_model=StoreSettingsOut)
def update_settings(payload: StoreSettingsInput, db: Session = Depends(get_db)):
    settings = _get_or_create(db)
    for key, value in payload.model_dump().items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings
