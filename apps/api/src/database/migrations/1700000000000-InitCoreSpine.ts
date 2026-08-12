import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Foundation migration (§9 build sequence, §11 schema conventions):
 *  - one Postgres schema per module family, even for modules not yet built
 *  - the core spine tables: tenants, branches, users, roles, permissions,
 *    role_permissions, user_roles, patients
 *  - Row-Level Security enabled + a tenant-isolation policy on every
 *    tenant-owned table, driven by the `app.tenant_id` session var that
 *    TenantInterceptor (and AuthService.login) set with `SET LOCAL`
 *
 * Everything after this migration is additive-only (§11 migration
 * governance) — this is the one migration allowed to lay foundation.
 */
export class InitCoreSpine1700000000000 implements MigrationInterface {
  name = "InitCoreSpine1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    // One schema per module family (§11) — created up front so the
    // module boundary is visible in the database from day one, even
    // before every module has tables in it.
    for (const schema of ["platform", "core", "clinical", "pharmacy", "lab", "billing", "hr", "records"]) {
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    }

    // ---- platform.tenants — the one table with no tenant_id / no RLS ----
    await queryRunner.query(`
      CREATE TABLE platform.tenants (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL,
        plan varchar NOT NULL DEFAULT 'trial',
        status varchar NOT NULL DEFAULT 'trial',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // ---- platform.branches ----
    await this.createTenantScopedTable(queryRunner, "platform", "branches", `
      name varchar NOT NULL,
      address varchar,
      is_primary boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE platform.branches
        ADD CONSTRAINT fk_branches_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id)
    `);

    // ---- core.users ----
    await this.createTenantScopedTable(queryRunner, "core", "users", `
      branch_id uuid,
      name varchar NOT NULL,
      email varchar NOT NULL,
      phone varchar,
      password_hash varchar NOT NULL,
      status varchar NOT NULL DEFAULT 'active'
    `);
    await queryRunner.query(`
      ALTER TABLE core.users
        ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES platform.branches(id)
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_users_tenant_email ON core.users (tenant_id, email)`);

    // ---- core.roles ----
    await this.createTenantScopedTable(queryRunner, "core", "roles", `
      key varchar NOT NULL,
      name varchar NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE core.roles
        ADD CONSTRAINT fk_roles_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id)
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_roles_tenant_key ON core.roles (tenant_id, key)`);

    // ---- core.permissions — global catalog, no tenant_id, no RLS ----
    await queryRunner.query(`
      CREATE TABLE core.permissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        module varchar NOT NULL,
        action varchar NOT NULL,
        description varchar
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_permissions_module_action ON core.permissions (module, action)`);

    // ---- core.role_permissions ----
    await this.createTenantScopedTable(queryRunner, "core", "role_permissions", `
      role_id uuid NOT NULL,
      permission_id uuid NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE core.role_permissions
        ADD CONSTRAINT fk_role_permissions_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES core.roles(id),
        ADD CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES core.permissions(id)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_role_permissions_unique ON core.role_permissions (tenant_id, role_id, permission_id)
    `);

    // ---- core.user_roles ----
    await this.createTenantScopedTable(queryRunner, "core", "user_roles", `
      user_id uuid NOT NULL,
      role_id uuid NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE core.user_roles
        ADD CONSTRAINT fk_user_roles_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES core.users(id),
        ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES core.roles(id)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_user_roles_unique ON core.user_roles (tenant_id, user_id, role_id)
    `);

    // ---- core.patients ----
    await this.createTenantScopedTable(queryRunner, "core", "patients", `
      branch_id uuid,
      mrn varchar NOT NULL,
      name varchar NOT NULL,
      date_of_birth date,
      gender varchar,
      phone varchar,
      custom_attributes jsonb NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      ALTER TABLE core.patients
        ADD CONSTRAINT fk_patients_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_patients_branch FOREIGN KEY (branch_id) REFERENCES platform.branches(id)
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_patients_tenant_mrn ON core.patients (tenant_id, mrn)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS core.patients`);
    await queryRunner.query(`DROP TABLE IF EXISTS core.user_roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS core.role_permissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS core.permissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS core.roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS core.users`);
    await queryRunner.query(`DROP TABLE IF EXISTS platform.branches`);
    await queryRunner.query(`DROP TABLE IF EXISTS platform.tenants`);
    for (const schema of ["records", "hr", "billing", "lab", "pharmacy", "clinical", "core", "platform"]) {
      await queryRunner.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    }
  }

  /**
   * Every tenant-owned table is built the same way: UUID PK, tenant_id +
   * full audit columns (§11), a leading tenant_id index, RLS enabled, and
   * one policy checking `app.tenant_id` — the exact mechanism
   * TenantInterceptor and AuthService.login populate per request/login.
   */
  private async createTenantScopedTable(
    queryRunner: QueryRunner,
    schema: string,
    table: string,
    moduleColumnsSql: string,
  ): Promise<void> {
    const qualified = `${schema}.${table}`;
    await queryRunner.query(`
      CREATE TABLE ${qualified} (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        ${moduleColumnsSql},
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        created_by uuid,
        updated_by uuid,
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_${schema}_${table}_tenant ON ${qualified} (tenant_id)`);
    await queryRunner.query(`ALTER TABLE ${qualified} ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`
      CREATE POLICY tenant_isolation ON ${qualified}
        USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
        WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid)
    `);
  }
}
