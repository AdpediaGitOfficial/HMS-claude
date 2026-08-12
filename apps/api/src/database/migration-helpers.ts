import { QueryRunner } from "typeorm";

/**
 * Every tenant-owned table is built the same way (§11): UUID PK, tenant_id
 * + full audit columns, a leading tenant_id index, RLS enabled, and one
 * policy checking `app.tenant_id` — the session var TenantInterceptor and
 * AuthService.login populate per request/login. Shared across every
 * migration that adds a new module so the convention can't drift.
 */
export async function createTenantScopedTable(
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
  // FORCE matters here: Postgres exempts a table's *owner* from RLS by
  // default, and the migration role is that owner (it ran CREATE TABLE).
  // Without FORCE, RLS would silently do nothing as long as the app
  // connects with the same role that ran migrations — the isolation
  // guarantee in §11 depends on this line, not just ENABLE.
  await queryRunner.query(`ALTER TABLE ${qualified} FORCE ROW LEVEL SECURITY`);
  await queryRunner.query(`
    CREATE POLICY tenant_isolation ON ${qualified}
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid)
  `);
}

export async function dropTenantScopedTable(queryRunner: QueryRunner, schema: string, table: string): Promise<void> {
  await queryRunner.query(`DROP TABLE IF EXISTS ${schema}.${table}`);
}
