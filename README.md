# Inventry Admin

Next.js + TypeScript Super Admin panel for the Inventry multi-tenant
inventory SaaS. Talks to the existing Node.js/Express backend
(`../backend`) — no backend logic is duplicated here.

## Tech stack

Next.js (App Router, Turbopack) · TypeScript · Tailwind CSS v4 ·
TanStack Query · React Hook Form + Zod · Axios · Lucide React

## Setup

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at the backend
npm run dev
```

The backend must be running (see `../backend/README.md`) with a Super Admin
already bootstrapped (`npm run bootstrap:super-admin` in `../backend`).

## Build

```bash
npm run build
npm start
```

## Environment

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | e.g. `http://localhost:4000/api/v1` |

## Authentication architecture

- **Access token**: held only in memory (`lib/auth/tokenStorage.ts`) — never
  written to `localStorage`, so it can't be read back by a page reload or a
  script dumping storage at leisure. Lost on refresh by design.
- **Refresh token**: persisted in `localStorage` so a reload doesn't force a
  fresh login. `AuthProvider` exchanges it for a new access token on mount.
  This is an inherent XSS tradeoff of doing token handling entirely
  client-side (as this app's spec calls for) rather than proxying auth
  through Next.js route handlers with httpOnly cookies — documented here
  rather than silently accepted.
- **Axios client** (`lib/api/client.ts`): attaches the access token to every
  request, and on a 401 (except from `/auth/login`/`/auth/refresh`
  themselves) transparently refreshes once and retries — concurrent 401s
  queue behind a single in-flight refresh rather than each racing their own.
  If the refresh itself fails, tokens are cleared and every page reroutes to
  `/login` via `AuthProvider`'s `status: 'unauthenticated'`.
- **Protected routes**: `app/(dashboard)/layout.tsx` redirects to `/login`
  whenever auth status resolves to unauthenticated; `/login` redirects to
  `/dashboard` if already authenticated.

## Pages

- `/login` — mobile number + password
- `/dashboard` — business counts, platform totals (products, sales,
  purchases, low stock), recent sales/purchases and a low-stock summary
- `/businesses` — search, status filter, sortable columns, pagination, row
  actions (View / Edit / Activate / Deactivate / Suspend)
- `/businesses/new` — Create Business form → `POST /api/v1/tenants`
  (`createTenantWithOwner`) — see "Backend contract decisions" below
- `/businesses/[id]` — business + owner info, edit, status actions, reset
  owner password, statistics grid (`GET /admin/tenants/:id/stats`)
- `/audit-logs` — real, paginated, backed by `GET /api/v1/audit-logs`
- `/settings` — Super Admin's own change-password
- `/products`, `/inventory`, `/sales`, `/purchases` — read-only,
  cross-business lists with search, business filter, status filter (and a
  date range for sales/purchases), paginated
- `/reports` — sales vs purchases for a period: totals, monthly trend,
  per-business breakdown

All of the above are backed by the backend's SUPER_ADMIN-only, read-only
`/api/v1/admin/*` endpoints (`backend/src/modules/admin`) — every number is
computed server-side; the tenant-scoped `/sales`, `/products`, ... routers
stay closed to SUPER_ADMIN.

## Backend contract decisions

Two things in the prompt didn't quite match the backend as it actually
exists, so I built against the real, working contract rather than either
fabricating backend behavior or building a broken frontend:

1. **Create Business calls `POST /api/v1/tenants`, not `POST /api/v1/users`.**
   The backend's atomic "create Tenant + Owner" operation
   (`createTenantWithOwner`) is `POST /api/v1/tenants`. `POST /api/v1/users`
   requires an *existing* `tenantId` and adds a teammate to it — calling it
   to create a brand-new business would fail (or require duplicating the
   atomic-creation logic backend-side, which the prompt says not to do).
   `tenantId` is still never sent from this frontend in either case — the
   backend derives/creates it.
2. **`GET /api/v1/tenants` gained `search`/`status`/`sortBy`/`sortOrder`
   query params**, and a new `PATCH /api/v1/tenants/:tenantId` endpoint was
   added for editing business details (distinct from the existing
   status-update endpoint). Neither existed before this panel needed them —
   both are small, additive extensions of already-existing endpoints using
   the backend's existing safe-filtering utilities, not new architecture.
   See `../backend/docs/AUTHENTICATION.md` §2–3 and the backend README's
   "What's implemented" section for the full rationale.

## Known limitations (honest gaps, not bugs)

- The cross-business views are **read-only** — the Super Admin can see every
  business's products, stock, sales and purchases but can't edit them; that
  stays with each business's own users.
- **No `GET /tenants/:id` endpoint exists yet** — a single business is
  fetched by paging through the list and matching the id client-side
  (`lib/api/tenants.ts::getTenantById`). Fine at this scale; revisit if a
  dedicated endpoint is added. The business filter on the list pages has the
  same 100-business ceiling.

## UI primitives

`components/ui/*` are hand-built (Button, Input, Select, Card, Badge,
Dialog, DropdownMenu, Table, Pagination, Skeleton, EmptyState, Toast,
ConfirmDialog) using Tailwind + Lucide icons directly — no headless-UI
library was added, since the requested tech stack didn't name one and the
interaction needs here (a modal, a click-toggle menu) are simple enough not
to warrant the dependency.
