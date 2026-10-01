import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.catalog import Collection, ProductCollection
from app.schemas.collection import CollectionAdminOut, CollectionInput, CollectionOut
from app.security import require_staff

router = APIRouter(tags=["collections"])


@router.get("/collections", response_model=list[CollectionOut])
def list_collections(featured_only: bool = False, db: Session = Depends(get_db)):
    stmt = select(Collection).order_by(Collection.name)
    if featured_only:
        stmt = stmt.where(Collection.is_featured.is_(True))
    return db.execute(stmt).scalars().all()


@router.get("/collections/{slug}", response_model=CollectionOut)
def get_collection(slug: str, db: Session = Depends(get_db)):
    collection = db.execute(select(Collection).where(Collection.slug == slug)).scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection


admin_router = APIRouter(prefix="/admin", tags=["admin:collections"], dependencies=[Depends(require_staff)])


@admin_router.get("/collections", response_model=list[CollectionAdminOut])
def admin_list_collections(db: Session = Depends(get_db)):
    counts = dict(
        db.execute(
            select(ProductCollection.collection_id, func.count()).group_by(ProductCollection.collection_id)
        ).all()
    )
    collections = db.execute(select(Collection).order_by(Collection.created_at.desc())).scalars().all()
    return [
        CollectionAdminOut(**CollectionOut.model_validate(c).model_dump(), product_count=counts.get(c.id, 0))
        for c in collections
    ]


@admin_router.post("/collections", response_model=CollectionOut, status_code=201)
def create_collection(payload: CollectionInput, db: Session = Depends(get_db)):
    collection = Collection(**payload.model_dump())
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


@admin_router.put("/collections/{collection_id}", response_model=CollectionOut)
def update_collection(collection_id: uuid.UUID, payload: CollectionInput, db: Session = Depends(get_db)):
    collection = db.get(Collection, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    for key, value in payload.model_dump().items():
        setattr(collection, key, value)
    db.commit()
    db.refresh(collection)
    return collection


@admin_router.delete("/collections/{collection_id}", status_code=204)
def delete_collection(collection_id: uuid.UUID, db: Session = Depends(get_db)):
    collection = db.get(Collection, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    db.delete(collection)
    db.commit()
