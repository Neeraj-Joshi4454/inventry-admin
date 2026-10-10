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
- `/dashboard` — business counts (real, backend-computed) + reserved cards
  for metrics that don't have a backing API yet (see below)
- `/businesses` — search, status filter, sortable columns, pagination, row
  actions (View / Edit / Activate / Deactivate / Suspend)
- `/businesses/new` — Create Business form → `POST /api/v1/tenants`
  (`createTenantWithOwner`) — see "Backend contract decisions" below
- `/businesses/[id]` — business + owner info, edit, status actions, reset
  owner password, reserved statistics grid
- `/audit-logs` — real, paginated, backed by `GET /api/v1/audit-logs`
- `/settings` — Super Admin's own change-password
- `/products`, `/inventory`, `/sales`, `/purchases`, `/reports` — present in
  the sidebar per spec, each a "not built yet" placeholder page (explicitly
  out of scope for this phase)

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

Per the prompt, Products/Inventory/Sales/Purchases/Reports management is
out of scope for this phase — and several dashboard/detail-page elements
the prompt describes depend on those modules or on cross-tenant aggregate
endpoints that don't exist yet:

- **Dashboard**: "Total Products", "Total Sales", "Total Purchases", "Low
  Stock Products" cards, and the "Recent Sales"/"Recent Purchases"/
  "Low-Stock Summary" panels are rendered as explicit "Coming soon" states,
  not fabricated numbers. "Total/Active/Inactive Businesses" and "Recent
  Businesses" **are** real, backed by `GET /tenants`'s server-computed
  pagination totals — never summed or calculated in the frontend.
- **Business Details statistics** (Products, Current Inventory, Sales,
  Purchases, Customers, Suppliers counts) are shown as a reserved,
  explicitly-unavailable grid for the same reason — even for Sales, which
  partially exists, there's no cross-tenant Super Admin aggregate endpoint
  yet (the existing `GET /sales` is tenant-scoped and blocks SUPER_ADMIN by
  design, since SUPER_ADMIN has no "own tenant").
- **No `GET /tenants/:id` endpoint exists yet** — a single business is
  fetched by paging through the list and matching the id client-side
  (`lib/api/tenants.ts::getTenantById`). Fine at this scale; revisit if a
  dedicated endpoint is added.

## UI primitives

`components/ui/*` are hand-built (Button, Input, Select, Card, Badge,
Dialog, DropdownMenu, Table, Pagination, Skeleton, EmptyState, Toast,
ConfirmDialog) using Tailwind + Lucide icons directly — no headless-UI
library was added, since the requested tech stack didn't name one and the
interaction needs here (a modal, a click-toggle menu) are simple enough not
to warrant the dependency.
