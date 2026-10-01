"""Seeds sample categories, collections, products, and a coupon for local development.

Note: unlike the old Prisma seed, this does NOT create an admin login — auth is handled by
Supabase now. Sign up normally through the frontend, then promote yourself:

    UPDATE profiles SET role = 'ADMIN' WHERE email = 'you@example.com';
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db import SessionLocal
from app.models.catalog import Category, Collection, Product, ProductCollection, ProductImage, ProductVariant
from app.models.coupon import Coupon
from app.models.enums import CouponType


def upsert_category(db, name: str, slug: str) -> Category:
    existing = db.query(Category).filter_by(slug=slug).first()
    if existing:
        return existing
    category = Category(name=name, slug=slug)
    db.add(category)
    db.flush()
    return category


def upsert_collection(db, name: str, slug: str, is_featured: bool) -> Collection:
    existing = db.query(Collection).filter_by(slug=slug).first()
    if existing:
        return existing
    collection = Collection(name=name, slug=slug, is_featured=is_featured)
    db.add(collection)
    db.flush()
    return collection


def main():
    db = SessionLocal()
    try:
        dark_choc = upsert_category(db, "Dark Chocolate", "dark-chocolate")
        truffles = upsert_category(db, "Truffles", "truffles")

        single_origin = upsert_collection(db, "Single Origin", "single-origin", True)
        infusions = upsert_collection(db, "Infusions & Citrus", "infusions-citrus", True)
        atelier_truffles = upsert_collection(db, "The Atelier Truffles", "atelier-truffles", True)
        gift_boxes = upsert_collection(db, "Gift Boxes", "gift-boxes", False)

        products = [
            dict(
                slug="madagascar-72-blood-orange",
                name="Madagascar 72% with Candied Blood Orange",
                short_description="Single-origin, 72% cocoa with candied citrus",
                description="A vibrant contrast of high-strength Sambirano cocoa and organic candied blood orange peel.",
                category_id=dark_choc.id,
                cocoa_percent=72,
                is_featured=True,
                is_bestseller=True,
                image="https://images.unsplash.com/photo-1621939514649-280e2ee25f60",
                variants=[
                    dict(sku="Z-MD72-50", label="50g", weight_grams=50, price=14, compare_price=16, stock=40),
                    dict(sku="Z-MD72-100", label="100g", weight_grams=100, price=24, stock=25),
                ],
                collections=[single_origin.id, atelier_truffles.id],
            ),
            dict(
                slug="ecuador-85-single-farm-criollo",
                name="Ecuador 85% Single-Farm Criollo",
                short_description="Intense single-farm Criollo, 85% cocoa",
                description="A bold, single-origin dark chocolate bar sourced from a heritage Criollo estate.",
                category_id=dark_choc.id,
                cocoa_percent=85,
                is_featured=True,
                is_bestseller=True,
                image="https://images.unsplash.com/photo-1606312619070-d48b4c652a52",
                variants=[dict(sku="Z-EC85-100", label="100g", weight_grams=100, price=16, stock=94)],
                collections=[single_origin.id],
            ),
            dict(
                slug="velvet-lavender-thyme-infusion",
                name="Velvet Lavender & Thyme Infusion",
                short_description="75% dark chocolate infused with botanical herbs",
                description="Our signature dark block paired with organic lavender and thyme botanicals.",
                category_id=dark_choc.id,
                cocoa_percent=75,
                image="https://images.unsplash.com/photo-1481391319762-47dff72954d9",
                variants=[dict(sku="Z-LV75-100", label="100g", weight_grams=100, price=15, stock=60)],
                collections=[infusions.id],
            ),
            dict(
                slug="atelier-truffle-selection",
                name="Atelier Truffle Selection (Box of 12)",
                short_description="Hand-rolled ganache truffles, assorted",
                description="Hand-rolled ganache covered in dusty roasted cocoa powder, delicate shell, creamy heart.",
                category_id=truffles.id,
                is_featured=True,
                image="https://images.unsplash.com/photo-1607920591413-4ec007e70023",
                variants=[dict(sku="Z-BOX-TR12", label="12 pieces", price=38, stock=34, low_stock_at=10)],
                collections=[atelier_truffles.id, gift_boxes.id],
            ),
        ]

        for p in products:
            if db.query(Product).filter_by(slug=p["slug"]).first():
                continue

            product = Product(
                name=p["name"],
                slug=p["slug"],
                short_description=p.get("short_description"),
                description=p.get("description"),
                category_id=p.get("category_id"),
                cocoa_percent=p.get("cocoa_percent"),
                is_featured=p.get("is_featured", False),
                is_bestseller=p.get("is_bestseller", False),
                images=[ProductImage(url=p["image"], position=0)],
                variants=[ProductVariant(**v) for v in p["variants"]],
            )
            db.add(product)
            db.flush()
            for collection_id in p["collections"]:
                db.add(ProductCollection(product_id=product.id, collection_id=collection_id))

        if not db.query(Coupon).filter_by(code="ZESTWELCOME").first():
            db.add(
                Coupon(
                    code="ZESTWELCOME",
                    type=CouponType.PERCENTAGE,
                    value=10,
                    min_order_value=20,
                    usage_limit=500,
                    per_user_limit=1,
                )
            )

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
