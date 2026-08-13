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

## What's implemented

All five steps of the build order (architecture plan §9) are done, end to
end (migration → RLS → API → UI), covering every module in the catalog
(`packages/shared/src/modules.ts`):

- **Foundation**: Tenant, Branch, Auth/RBAC, Patient Registry.
- **Clinical core**: Appointments (booking + check-in) → Encounters (the
  Visit spine entity from §11) → EHR clinical notes (vitals/diagnosis/
  prescription, charted per encounter) → IPD bed management (wards, beds,
  admit/discharge with a DB-level guarantee that a bed can't be
  double-booked).
- **Operational modules**: the generic `clinical.orders` spine (§11) that
  Pharmacy, Lab, and Radiology each fulfil via their own companion table —
  Pharmacy (stock + dispense against an order, with a stock-on-hand guard),
  Lab & Radiology (test catalog + order + worklist + report), Blood Bank
  (inventory by type + issue-to-patient). A doctor places orders directly
  from the EHR encounter screen; they show up in the relevant module's
  queue.
- **Financial modules**: Billing & Finance (generate an invoice from an
  encounter → add line items → issue → record payments, with the invoice
  status derived automatically from payments received: `draft` →
  `issued` → `partially_paid`/`paid`) and Insurance/TPA Claims (submit a
  claim against an issued invoice, then approve/reject/settle from a
  dedicated worklist).
- **Org & records modules**: Reports & Audit (a cross-module summary read
  from every module above, plus an append-only audit log written
  automatically by `TenantInterceptor` for every mutating request — no
  module has to remember to log itself), HR & Payroll (employee records,
  daily attendance, payroll runs that generate one payslip per employee),
  Ambulance (fleet + dispatch, with a guard against double-dispatching a
  vehicle already on a trip), Referral (pending → accepted → completed),
  Birth & Death Record (statutory registers).

Every module followed the same extension mechanism from §11: new Postgres
schema/tables via an additive migration, entities extending
`TenantScopedEntity`, new permission rows in the seed, and a new nav entry
that appears automatically since the sidebar is generated from
`packages/shared/src/modules.ts` — nothing earlier ever had to change for a
later module to exist.

Not built: multi-branch UI (the `Branch` entity exists in the schema per
§11 but there's no UI for managing multiple branches yet), and RBAC is
currently coarse — every seeded demo user holds the `admin` role rather
than the fine-grained role → permission subsets described in §5 of the
architecture plan.

## Multi-tenancy & security notes

- Every tenant-owned table carries `tenant_id` and a Postgres RLS policy
  (`app.tenant_id` session var). `TenantInterceptor`
  (`apps/api/src/common/tenant/tenant.interceptor.ts`) sets that variable
  per authenticated request; **service code must read/write through
  `tenantManager()`** (`common/tenant/tenant-context.ts`), not
  `@InjectRepository`, or RLS silently returns nothing.
- Every tenant-scoped table is created with both `ENABLE ROW LEVEL
  SECURITY` and `FORCE ROW LEVEL SECURITY` (`database/migration-helpers.ts`).
  The `FORCE` matters: Postgres exempts a table's *owner* from RLS by
  default, and the role that runs migrations owns every table it creates —
  without `FORCE`, RLS would silently do nothing whenever the app connects
  as that same role. Verified directly against Postgres during scaffolding:
  a query with no `app.tenant_id` set returns zero rows even for the table
  owner; run as a Postgres superuser is the one case that still bypasses
  RLS entirely, which is expected and why the app's runtime role should
  never be a superuser in any real environment.
- `LoginDto.tenantId` is client-supplied for now — production auth should
  resolve the tenant from the request's subdomain/host before this DTO is
  ever built. Flagged in `auth/dto/login.dto.ts`.
- `JWT_SECRET` in `.env.example` is a placeholder — generate a real secret
  before deploying anywhere real.
