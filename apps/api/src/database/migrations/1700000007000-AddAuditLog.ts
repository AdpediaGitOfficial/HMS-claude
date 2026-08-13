import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * core.audit_log — deliberately not built with createTenantScopedTable()
 * (§11's usual helper): an append-only log doesn't need created_by/
 * updated_by/deleted_at, since it is itself the record of who did what and
 * is never edited. Still tenant-scoped with the same RLS mechanism as
 * everything else.
 */
export class AddAuditLog1700000007000 implements MigrationInterface {
  name = "AddAuditLog1700000007000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE core.audit_log (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        actor_id uuid NOT NULL,
        method varchar NOT NULL,
        path varchar NOT NULL,
        status_code int NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      ALTER TABLE core.audit_log
        ADD CONSTRAINT fk_audit_log_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_audit_log_actor FOREIGN KEY (actor_id) REFERENCES core.users(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_audit_log_tenant_created ON core.audit_log (tenant_id, created_at DESC)`);
    await queryRunner.query(`ALTER TABLE core.audit_log ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE core.audit_log FORCE ROW LEVEL SECURITY`);
    await queryRunner.query(`
      CREATE POLICY tenant_isolation ON core.audit_log
        USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
        WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS core.audit_log`);
  }
}
