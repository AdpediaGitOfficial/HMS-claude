import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

/**
 * TPA/insurer master list (§11 "lookup table instead of enum" — the set of
 * payers a tenant works with grows over time and shouldn't require a
 * migration to extend). Same shape as lab.test_catalog: a small,
 * tenant-maintained catalog, not a system-wide fixed list.
 *
 * Patients reference this by FK (added in AddPatientDetails, next
 * migration) instead of typing an insurer name freehand — that's the
 * actual fix for "TPA" being a disconnected text field. billing.tpa_claims
 * keeps its own free-text insurer_name/policy_number columns unchanged:
 * a claim is a financial/legal record and must not silently reword itself
 * if a provider's catalog entry is renamed later, so it stays a snapshot
 * rather than a live reference.
 */
export class AddTpaProviders1700000012000 implements MigrationInterface {
  name = "AddTpaProviders1700000012000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "billing", "tpa_providers", `
      name varchar NOT NULL,
      contact_phone varchar,
      contact_email varchar
    `);
    await queryRunner.query(`
      ALTER TABLE billing.tpa_providers
        ADD CONSTRAINT fk_tpa_providers_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id)
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_tpa_providers_tenant_name ON billing.tpa_providers (tenant_id, name)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "billing", "tpa_providers");
  }
}
