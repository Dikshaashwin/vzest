from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import Profile
from app.schemas.auth import MeOut, UpdateMeInput
from app.security import get_current_user

router = APIRouter(prefix="/me", tags=["auth"])


@router.get("", response_model=MeOut)
def get_me(user: Profile = Depends(get_current_user)):
    return user


@router.patch("", response_model=MeOut)
def update_me(payload: UpdateMeInput, db: Session = Depends(get_db), user: Profile = Depends(get_current_user)):
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
