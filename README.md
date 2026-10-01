# Zest

Chocolate e-commerce platform, split into two independently deployable apps:

```
frontend/   Next.js storefront + admin UI (see frontend/README.md)
backend/    FastAPI + SQLAlchemy API, Supabase Postgres + Supabase Auth (see backend/README.md)
```

## Status

- **Backend:** built and verified end-to-end against a local Postgres DB (checkout → order
  creation → tracking, Supabase-JWT auth with role enforcement, dashboard aggregation all
  tested manually). See `backend/README.md` to run it.
- **Frontend:** still wired to the old Prisma/NextAuth backend from before the split. It has
  **not yet been updated** to call the new FastAPI service or Supabase Auth — that's the next
  piece of work. Until then, `frontend/` won't run against a real database (its own `prisma/`
  setup was left in place at the repo root for reference during that rewiring pass, but is no
  longer the source of truth for the schema — `backend/app/models` is).

## Local development

Each app has its own dependencies and `.env`. Run them side by side:

```bash
# Terminal 1 — backend
cd backend
.venv/bin/uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm run dev
```
