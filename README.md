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
deploy/         Nginx site config template for production
ecosystem.config.js  pm2 process definition for the API in production
```

## Run locally

Everything runs as plain Node processes — no containers. Install Postgres
16+ and Redis however you like (a package manager, an existing local
instance, whatever's already on your machine), then:

```bash
pnpm install
createdb hms                          # or: psql -c "CREATE DATABASE hms"
cp apps/api/.env.example apps/api/.env  # edit DATABASE_URL if needed
pnpm --filter @hms/api migration:run
pnpm --filter @hms/api seed
pnpm dev:api     # http://localhost:3000
pnpm dev:web     # http://localhost:5173
```

The seed command prints a `tenantId`, plus a demo login
(`admin@sunrise.test` / `ChangeMe123!`) — use those on the login screen at
http://localhost:5173.

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

No containers in production either — the API runs as a plain Node process
under **pm2** (auto-restart on crash/reboot), Postgres and Redis are native
packages on the same box, and **Nginx** serves the built React app and
reverse-proxies `/api/*` to the API, with **certbot** handling HTTPS.

```
Internet ──▶ Nginx (:80/:443) ──▶ /api/*  → hms-api (pm2, 127.0.0.1:3000) → postgres (localhost)
                    │                                                     → redis (localhost)
                    └── everything else → apps/web/dist (static files)
```

### 1. Provision a server

Any VM with a public IP works (2 vCPU / 4 GB RAM is comfortable to start).
Point a domain's DNS `A` record at it now if you have one — you can also
add HTTPS later. Open ports **80** and **443** in the firewall/security
group; nothing else needs to be public (Postgres/Redis/the API stay bound
to localhost).

### 2. Install dependencies

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql redis-server nginx certbot python3-certbot-nginx
sudo corepack enable
sudo npm install -g pm2
```

### 3. Set up Postgres

```bash
sudo -u postgres createuser hms --pwprompt   # set a strong password when prompted
sudo -u postgres createdb hms --owner=hms
```

Postgres and Redis are already localhost-only by default on a fresh
install — no config changes needed to keep them off the public internet.

### 4. Clone the repo and check out the branch

```bash
sudo mkdir -p /opt/hms && sudo chown $USER /opt/hms
git clone https://github.com/AdpediaGitOfficial/HMS-claude.git /opt/hms
cd /opt/hms
git checkout claude/hms-native-deploy
```

### 5. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

- `NODE_ENV=production`
- `DATABASE_URL` — `postgres://hms:YOUR_PASSWORD@localhost:5432/hms`
- `JWT_SECRET` — generate with `openssl rand -base64 48`
- `WEB_ORIGIN` — `http://SERVER_IP` for now (or `https://yourdomain.com`
  once you have one)

### 6. Build

```bash
pnpm install
pnpm -r build
```

### 7. Run migrations and seed a demo tenant (one-time)

```bash
pnpm --filter @hms/api migration:run:prod
pnpm --filter @hms/api seed:prod
```

The seed command prints a `tenantId` and demo login
(`admin@sunrise.test` / `ChangeMe123!`) — save that output, you'll need the
`tenantId` to log in.

### 8. Start the API with pm2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed command to enable pm2 on boot
```

### 9. Configure Nginx

```bash
sudo cp deploy/nginx.hms.conf.example /etc/nginx/sites-available/hms
sudo sed -i 's/your-domain-or-server-ip/SERVER_IP_OR_DOMAIN/' /etc/nginx/sites-available/hms
sudo ln -s /etc/nginx/sites-available/hms /etc/nginx/sites-enabled/hms
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 10. Verify

Visit `http://SERVER_IP` and log in with the tenant ID + credentials from
step 7. You should land on the dashboard with the full module suite in the
sidebar.

```bash
pm2 logs hms-api   # tail API logs if something looks wrong
```

### 11. Switch on HTTPS with a real domain (whenever you're ready)

Point the domain's DNS `A` record at the server, put that domain in place
of the IP in `/etc/nginx/sites-available/hms` (`server_name`), reload
Nginx, then:

```bash
sudo certbot --nginx -d yourdomain.com
```

certbot obtains a Let's Encrypt certificate, edits the Nginx config to add
the HTTPS server block + HTTP→HTTPS redirect, and sets up auto-renewal —
no further action needed. Update `WEB_ORIGIN` in `apps/api/.env` to
`https://yourdomain.com` and restart the API (`pm2 restart hms-api`).

### Shipping further updates

Once the live test above is good, later changes ship the same way:

```bash
cd /opt/hms
git pull
pnpm install
pnpm -r build
pnpm --filter @hms/api migration:run:prod   # only if the update includes new migrations
pm2 restart hms-api
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
