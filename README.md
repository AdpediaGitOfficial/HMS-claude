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

## Deploy to a live server

Production topology differs from local dev in three ways: everything runs
from compiled output (no `ts-node`/dev dependencies in the runtime images),
Postgres/Redis are never exposed on a public port, and **Caddy** is the one
public-facing container — it serves the built React app and reverse-proxies
`/api/*` to the internal API, obtaining and renewing HTTPS certificates
automatically once you point a domain at it (no Nginx/certbot setup needed).

```
Internet ──▶ Caddy (web, :80/:443) ──▶ /api/*  → api (internal only, :3000) → postgres (internal only)
                     │                                                      → redis (internal only)
                     └── everything else → React static build
```

You can test immediately against the server's bare IP over plain HTTP, then
switch to a real domain with automatic HTTPS later — same containers, one
env var change.

### 1. Provision a server

Any VM with a public IP works (2 vCPU / 4 GB RAM is comfortable to start).
Point a domain's DNS `A` record at it now if you have one — you can also
add this later. Open ports **80** and **443** in the firewall/security
group; nothing else needs to be public.

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
```

### 3. Clone the repo and check out the branch

```bash
git clone https://github.com/AdpediaGitOfficial/HMS-claude.git
cd HMS-claude
git checkout claude/hospital-erp-architecture-ly660l
```

### 4. Configure environment

```bash
cp .env.prod.example .env.prod
```

Edit `.env.prod`:

- `POSTGRES_PASSWORD` — generate with `openssl rand -base64 24`
- `JWT_SECRET` — generate with `openssl rand -base64 48`
- `WEB_ORIGIN` — `http://SERVER_IP` for now (or `https://yourdomain.com`
  once you have one)
- `DOMAIN` — leave as `:80` to test over the bare IP now; set to
  `yourdomain.com` once its DNS points here, for automatic HTTPS

### 5. Build and start the stack

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

### 6. Run migrations and seed a demo tenant (one-time)

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml exec api pnpm migration:run:prod
docker compose --env-file .env.prod -f docker-compose.prod.yml exec api pnpm seed:prod
```

The seed command prints a `tenantId` and demo login
(`admin@sunrise.test` / `ChangeMe123!`) — save that output, you'll need the
`tenantId` to log in.

### 7. Verify

Visit `http://SERVER_IP` (or your domain) and log in with the tenant ID +
credentials from step 6. You should land on the dashboard with the full
module suite in the sidebar.

```bash
# tail logs if something looks wrong
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f api
```

### 8. Switch on HTTPS with a real domain (whenever you're ready)

Point the domain's DNS `A` record at the server, then:

```bash
sed -i 's/^DOMAIN=.*/DOMAIN=yourdomain.com/' .env.prod
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
```

Caddy detects the change, requests a Let's Encrypt certificate for the
domain, and starts serving HTTPS — no other change needed.

### Shipping further updates

Once the live test above is good, later changes ship the same way:

```bash
git pull
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
# only if the update includes new migrations:
docker compose --env-file .env.prod -f docker-compose.prod.yml exec api pnpm migration:run:prod
```

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
