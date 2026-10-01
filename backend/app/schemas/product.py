import uuid
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class CategoryOut(ORMModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class ProductImageOut(ORMModel):
    id: uuid.UUID
    url: str
    alt_text: Optional[str] = None
    position: int


class ProductVariantOut(ORMModel):
    id: uuid.UUID
    sku: str
    label: str
    weight_grams: Optional[int] = None
    price: Decimal
    compare_price: Optional[Decimal] = None
    gst_percent: Decimal
    stock: int
    low_stock_at: int
    is_active: bool


class ProductCardOut(ORMModel):
    id: uuid.UUID
    name: str
    slug: str
    short_description: Optional[str] = None
    cocoa_percent: Optional[int] = None
    is_active: bool
    images: list[ProductImageOut] = []
    variants: list[ProductVariantOut] = []


class ProductDetailOut(ProductCardOut):
    description: Optional[str] = None
    ingredients: Optional[str] = None
    allergens: Optional[str] = None
    shelf_life: Optional[str] = None
    storage_info: Optional[str] = None
    is_vegetarian: bool
    is_featured: bool
    is_bestseller: bool
    category: Optional[CategoryOut] = None


class ProductListOut(BaseModel):
    products: list[ProductCardOut]
    total: int
    total_pages: int


class VariantInput(BaseModel):
    id: Optional[uuid.UUID] = None
    sku: str = Field(min_length=2)
    label: str = Field(min_length=1)
    weight_grams: Optional[int] = None
    price: Decimal = Field(gt=0)
    compare_price: Optional[Decimal] = Field(default=None, gt=0)
    gst_percent: Decimal = Decimal("18")
    stock: int = 0
    low_stock_at: int = 10


class ProductInput(BaseModel):
    name: str = Field(min_length=2)
    slug: str = Field(min_length=2)
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    cocoa_percent: Optional[int] = Field(default=None, ge=0, le=100)
    ingredients: Optional[str] = None
    allergens: Optional[str] = None
    shelf_life: Optional[str] = None
    storage_info: Optional[str] = None
    is_vegetarian: bool = True
    is_featured: bool = False
    is_bestseller: bool = False
    is_active: bool = True
    images: list[str] = []
    variants: list[VariantInput] = Field(min_length=1)
