# Zest API (FastAPI + SQLAlchemy + Supabase)

Python backend for the Zest chocolate platform. Talks to a Supabase Postgres database via
SQLAlchemy/Alembic, and trusts Supabase Auth for identity — this service verifies the JWT
Supabase issues to the frontend rather than handling passwords itself.

## Stack

- **Framework:** FastAPI
- **DB/ORM:** SQLAlchemy 2.0 + Alembic migrations, against Supabase's Postgres
- **Auth:** Supabase Auth. The frontend signs in via `supabase-js`; this API verifies the
  resulting JWT (`SUPABASE_JWT_SECRET`) on every protected request and auto-provisions a
  `profiles` row (role defaults to `CUSTOMER`) on first sight of a new user.
- **Payments:** Razorpay (order creation + signature verification), called directly over HTTP
- **Shipping:** Shiprocket — stubbed, needs credentials
- **Email:** Resend — stubbed, needs an API key

## Getting started

1. **Create a virtualenv and install dependencies:**
   ```bash
   python3.12 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   ```

2. **Configure `.env`** (copy `.env.example`). For local development without a Supabase project,
   point `DATABASE_URL` at a local Postgres instead — the schema is plain Postgres, so it works
   either way. `SUPABASE_JWT_SECRET` is only needed to verify real tokens; without it, all
   authenticated routes will reject requests.

3. **Run migrations:**
   ```bash
   .venv/bin/alembic upgrade head
   ```

4. **Seed sample data (optional):**
   ```bash
   .venv/bin/python scripts/seed.py
   ```
   This does *not* create a login — sign up through the frontend (Supabase Auth), then promote
   yourself to admin:
   ```sql
   UPDATE profiles SET role = 'ADMIN' WHERE email = 'you@example.com';
   ```

5. **Run the dev server:**
   ```bash
   .venv/bin/uvicorn app.main:app --reload --port 8000
   ```
   Interactive API docs: http://localhost:8000/docs

## Project structure

```
app/
  main.py          FastAPI app, CORS, router registration
  config.py        Settings (env vars) via pydantic-settings
  db.py            SQLAlchemy engine/session, declarative Base
  security.py      Supabase JWT verification, current-user dependencies, role gate
  models/          SQLAlchemy ORM models (profiles, catalog, orders, coupons, ...)
  schemas/         Pydantic request/response models
  routers/         One module per resource; public + /admin routes live side by side
  services/        Razorpay, Shiprocket, Resend wrappers; inventory ledger, coupon
                    validation, and cart-pricing logic shared across routers
alembic/           Migrations (env.py reads DATABASE_URL from app.config)
scripts/seed.py    Sample categories/collections/products/coupon
```

## Design notes

- **Orders snapshot their shipping address** (`shipping_*` columns on `Order`) rather than
  pointing at a mutable `Address` row — an order must not change retroactively if the customer
  edits or deletes a saved address later. The `Address` table is only the account "saved
  addresses" book.
- **Guest checkout is supported.** `Order.user_id` is nullable; customer name/email/phone are
  stored directly on the order. No fake Supabase Auth account is created for guests.
- **Inventory changes always go through `services/inventory.record_inventory_movement`**, which
  updates `ProductVariant.stock` and writes an `InventoryTransaction` row in the same DB
  transaction — used by both manual admin adjustments and order placement/cancellation, so stock
  and its audit trail can never drift apart.
- **Razorpay/Shiprocket/Resend are called directly over HTTP** (no SDKs) to avoid dependency
  weight and, in Razorpay's case, a deprecated `pkg_resources` transitive dependency.

## Known gap

The Next.js frontend (`../frontend`) was built against Prisma + NextAuth and has **not yet been
rewired** to call this API or Supabase Auth — that's the next phase.
