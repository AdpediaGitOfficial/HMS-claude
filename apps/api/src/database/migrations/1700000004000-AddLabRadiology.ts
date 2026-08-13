import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

export class AddLabRadiology1700000004000 implements MigrationInterface {
  name = "AddLabRadiology1700000004000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "lab", "test_catalog", `
      name varchar NOT NULL,
      category varchar NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE lab.test_catalog
        ADD CONSTRAINT fk_test_catalog_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id)
    `);

    await createTenantScopedTable(queryRunner, "lab", "test_results", `
      order_id uuid NOT NULL,
      test_catalog_id uuid NOT NULL,
      result_value text,
      result_status varchar NOT NULL DEFAULT 'pending',
      reported_by uuid,
      reported_at timestamptz
    `);
    await queryRunner.query(`
      ALTER TABLE lab.test_results
        ADD CONSTRAINT fk_test_results_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_test_results_order FOREIGN KEY (order_id) REFERENCES clinical.orders(id),
        ADD CONSTRAINT fk_test_results_catalog FOREIGN KEY (test_catalog_id) REFERENCES lab.test_catalog(id),
        ADD CONSTRAINT fk_test_results_reported_by FOREIGN KEY (reported_by) REFERENCES core.users(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_test_results_status ON lab.test_results (tenant_id, result_status)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "lab", "test_results");
    await dropTenantScopedTable(queryRunner, "lab", "test_catalog");
  }
}
