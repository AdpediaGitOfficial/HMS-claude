# HMS — Hospital Management ERP

Multi-tenant hospital ERP, built as a modular monolith. Full architecture,
UI/UX design system, and database schema rationale live in the project's
planning document — see the linked artifacts below for the visual
reference this scaffold implements.

## Stack

- **API**: NestJS + TypeORM + PostgreSQL, JWT auth, Postgres Row-Level
  Security for tenant isolation.
- **Web**: React + Vite + Tailwind CSS, themed to the design-system tokens
  (indigo `#373F99` / `#16255D` on white).
- **Shared**: `@hms/shared` — the module catalog and role→module matrix
  both the sidebar nav and the permission seed are generated from.

## Repo layout

```
apps/api/       NestJS backend (schema-per-module: platform, core, clinical, ...)
apps/web/       React frontend
packages/shared/ Module catalog + role→module matrix (single source of truth)
docker-compose.yml
```

## Run locally

**Option A — Docker Compose (Postgres + Redis + API + Web):**

```bash
docker compose up
```

Then run migrations and seed a demo tenant (one-time):

```bash
docker compose exec api pnpm migration:run
docker compose exec api pnpm seed
```

The seed command prints a `tenantId`, plus a demo login
(`admin@sunrise.test` / `ChangeMe123!`) — use those on the login screen at
http://localhost:5173.

**Option B — run natively:**

```bash
pnpm install
docker compose up -d postgres redis   # just the datastores
cp apps/api/.env.example apps/api/.env
pnpm --filter @hms/api migration:run
pnpm --filter @hms/api seed
pnpm dev:api     # http://localhost:3000
pnpm dev:web     # http://localhost:5173
```

## What's implemented vs. scaffolded

This is the **foundation** step of the build order (architecture plan §9):
Tenant, Branch, Auth/RBAC, and Patient Registry are fully wired end to end
(migration → RLS → API → login → list/create UI). The remaining modules in
the catalog (`packages/shared/src/modules.ts`) are planned and will be
added the same way — new schema, new entities extending
`TenantScopedEntity`, new permission rows, new nav entry (automatic, since
nav is generated from the catalog) — without touching what's already here.
See §11 of the architecture plan for the extension mechanism this relies
on (companion tables, never altering an existing module's tables).

## Multi-tenancy & security notes

- Every tenant-owned table carries `tenant_id` and a Postgres RLS policy
  (`app.tenant_id` session var). `TenantInterceptor`
  (`apps/api/src/common/tenant/tenant.interceptor.ts`) sets that variable
  per authenticated request; **service code must read/write through
  `tenantManager()`** (`common/tenant/tenant-context.ts`), not
  `@InjectRepository`, or RLS silently returns nothing.
- `LoginDto.tenantId` is client-supplied for now — production auth should
  resolve the tenant from the request's subdomain/host before this DTO is
  ever built. Flagged in `auth/dto/login.dto.ts`.
- `JWT_SECRET` in `.env.example` is a placeholder — generate a real secret
  before deploying anywhere real.
