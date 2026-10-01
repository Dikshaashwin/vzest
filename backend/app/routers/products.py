import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models.catalog import Category, Product, ProductCollection, ProductImage, ProductVariant
from app.schemas.product import (
    CategoryOut,
    ProductDetailOut,
    ProductInput,
    ProductListOut,
)
from app.security import require_staff

router = APIRouter(tags=["products"])

PRODUCT_LOAD_OPTS = (
    selectinload(Product.images),
    selectinload(Product.variants),
    selectinload(Product.category),
)


@router.get("/products", response_model=ProductListOut)
def list_products(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(default=None, description="Comma-separated category slugs"),
    collection: Optional[str] = None,
    search: Optional[str] = None,
    cocoa_min: Optional[int] = None,
    cocoa_max: Optional[int] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    sort: str = "best-sellers",
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=6, ge=1, le=48),
):
    stmt = select(Product).where(Product.is_active.is_(True)).options(*PRODUCT_LOAD_OPTS)

    if category:
        slugs = [s for s in category.split(",") if s]
        stmt = stmt.join(Product.category).where(Category.slug.in_(slugs))
    if collection:
        stmt = (
            stmt.join(Product.collections)
            .join(ProductCollection.collection)
            .where(ProductCollection.collection.has(slug=collection))
        )
    if search:
        stmt = stmt.where(Product.name.ilike(f"%{search}%"))
    if cocoa_min is not None or cocoa_max is not None:
        stmt = stmt.where(Product.cocoa_percent.between(cocoa_min or 0, cocoa_max or 100))

    if sort == "newest":
        stmt = stmt.order_by(Product.created_at.desc())
    elif sort == "best-sellers":
        stmt = stmt.order_by(Product.is_bestseller.desc(), Product.created_at.desc())
    else:
        stmt = stmt.order_by(Product.created_at.desc())

    products = list(db.execute(stmt).unique().scalars().all())

    if price_min is not None or price_max is not None:
        def min_price(p: Product) -> float:
            return min((float(v.price) for v in p.variants), default=0)

        products = [p for p in products if (price_min is None or min_price(p) >= price_min) and (price_max is None or min_price(p) <= price_max)]

    if sort in ("price-asc", "price-desc"):
        products.sort(
            key=lambda p: min((float(v.price) for v in p.variants), default=0),
            reverse=sort == "price-desc",
        )

    total = len(products)
    start = (page - 1) * per_page
    paged = products[start : start + per_page]

    return ProductListOut(products=paged, total=total, total_pages=max(1, -(-total // per_page)))


@router.get("/products/featured", response_model=list[ProductDetailOut])
def featured_products(db: Session = Depends(get_db)):
    stmt = select(Product).where(Product.is_active.is_(True), Product.is_featured.is_(True)).options(*PRODUCT_LOAD_OPTS).limit(8)
    return db.execute(stmt).unique().scalars().all()


@router.get("/products/bestsellers", response_model=list[ProductDetailOut])
def bestseller_products(db: Session = Depends(get_db)):
    stmt = select(Product).where(Product.is_active.is_(True), Product.is_bestseller.is_(True)).options(*PRODUCT_LOAD_OPTS).limit(8)
    return db.execute(stmt).unique().scalars().all()


@router.get("/products/{slug}", response_model=ProductDetailOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    stmt = select(Product).where(Product.slug == slug).options(*PRODUCT_LOAD_OPTS)
    product = db.execute(stmt).unique().scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.execute(select(Category).order_by(Category.name)).scalars().all()


# ---------- Admin ----------

admin_router = APIRouter(prefix="/admin", tags=["admin:products"], dependencies=[Depends(require_staff)])


@admin_router.get("/products", response_model=list[ProductDetailOut])
def admin_list_products(db: Session = Depends(get_db)):
    stmt = select(Product).options(*PRODUCT_LOAD_OPTS).order_by(Product.updated_at.desc())
    return db.execute(stmt).unique().scalars().all()


@admin_router.get("/products/{product_id}", response_model=ProductDetailOut)
def admin_get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.get(Product, product_id, options=list(PRODUCT_LOAD_OPTS))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@admin_router.post("/products", response_model=ProductDetailOut, status_code=201)
def create_product(payload: ProductInput, db: Session = Depends(get_db)):
    product = Product(
        name=payload.name,
        slug=payload.slug,
        short_description=payload.short_description,
        description=payload.description,
        category_id=payload.category_id,
        cocoa_percent=payload.cocoa_percent,
        ingredients=payload.ingredients,
        allergens=payload.allergens,
        shelf_life=payload.shelf_life,
        storage_info=payload.storage_info,
        is_vegetarian=payload.is_vegetarian,
        is_featured=payload.is_featured,
        is_bestseller=payload.is_bestseller,
        is_active=payload.is_active,
        images=[ProductImage(url=url, position=i) for i, url in enumerate(payload.images)],
        variants=[
            ProductVariant(
                sku=v.sku,
                label=v.label,
                weight_grams=v.weight_grams,
                price=v.price,
                compare_price=v.compare_price,
                gst_percent=v.gst_percent,
                stock=v.stock,
                low_stock_at=v.low_stock_at,
            )
            for v in payload.variants
        ],
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@admin_router.put("/products/{product_id}", response_model=ProductDetailOut)
def update_product(product_id: uuid.UUID, payload: ProductInput, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.name = payload.name
    product.slug = payload.slug
    product.short_description = payload.short_description
    product.description = payload.description
    product.category_id = payload.category_id
    product.cocoa_percent = payload.cocoa_percent
    product.ingredients = payload.ingredients
    product.allergens = payload.allergens
    product.shelf_life = payload.shelf_life
    product.storage_info = payload.storage_info
    product.is_vegetarian = payload.is_vegetarian
    product.is_featured = payload.is_featured
    product.is_bestseller = payload.is_bestseller
    product.is_active = payload.is_active

    for img in list(product.images):
        db.delete(img)
    product.images = [ProductImage(url=url, position=i) for i, url in enumerate(payload.images)]

    existing_variants = {v.id: v for v in product.variants}
    for v_input in payload.variants:
        if v_input.id and v_input.id in existing_variants:
            variant = existing_variants[v_input.id]
            variant.sku = v_input.sku
            variant.label = v_input.label
            variant.weight_grams = v_input.weight_grams
            variant.price = v_input.price
            variant.compare_price = v_input.compare_price
            variant.gst_percent = v_input.gst_percent
            variant.low_stock_at = v_input.low_stock_at
        else:
            product.variants.append(
                ProductVariant(
                    sku=v_input.sku,
                    label=v_input.label,
                    weight_grams=v_input.weight_grams,
                    price=v_input.price,
                    compare_price=v_input.compare_price,
                    gst_percent=v_input.gst_percent,
                    stock=v_input.stock,
                    low_stock_at=v_input.low_stock_at,
                )
            )

    db.commit()
    db.refresh(product)
    return product


@admin_router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()


@admin_router.patch("/products/{product_id}/active", response_model=ProductDetailOut)
def toggle_product_active(product_id: uuid.UUID, is_active: bool, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = is_active
    db.commit()
    db.refresh(product)
    return product
