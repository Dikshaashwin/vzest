from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import (
    addresses,
    auth,
    collections,
    coupons,
    customers,
    dashboard,
    homepage,
    inventory,
    leads,
    orders,
    products,
    settings as settings_router,
    wishlist,
)

settings = get_settings()

app = FastAPI(title="Zest API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public / customer-facing
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(collections.router)
app.include_router(coupons.router)
app.include_router(orders.router)
app.include_router(addresses.router)
app.include_router(wishlist.router)
app.include_router(leads.router)
app.include_router(homepage.router)

# Admin
app.include_router(products.admin_router)
app.include_router(collections.admin_router)
app.include_router(coupons.admin_router)
app.include_router(orders.admin_router)
app.include_router(inventory.router)
app.include_router(customers.router)
app.include_router(dashboard.router)
app.include_router(homepage.admin_router)
app.include_router(settings_router.router)
app.include_router(leads.admin_router)


@app.get("/health")
def health():
    return {"status": "ok"}
