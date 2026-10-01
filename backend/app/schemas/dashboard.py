from decimal import Decimal

from pydantic import BaseModel

from app.schemas.order import OrderOut


class DashboardStats(BaseModel):
    today_revenue: Decimal
    today_orders: int
    pending_orders: int
    low_stock_count: int
    out_of_stock_count: int
    total_customers: int


class TopProduct(BaseModel):
    product_id: str
    name: str
    units_sold: int


class DashboardOut(BaseModel):
    stats: DashboardStats
    recent_orders: list[OrderOut]
    top_products: list[TopProduct]
