import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

/**
 * The generic Order spine entity (§11) — introduced now because it's the
 * attachment point every operational module in this pass (Pharmacy, Lab,
 * Radiology) fulfils rather than growing its own encounter-linkage logic.
 */
export class AddOrders1700000002000 implements MigrationInterface {
  name = "AddOrders1700000002000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "clinical", "orders", `
      encounter_id uuid NOT NULL,
      order_type varchar NOT NULL,
      status varchar NOT NULL DEFAULT 'pending',
      ordered_by uuid NOT NULL,
      ordered_at timestamptz NOT NULL,
      notes text
    `);
    await queryRunner.query(`
      ALTER TABLE clinical.orders
        ADD CONSTRAINT fk_orders_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_orders_encounter FOREIGN KEY (encounter_id) REFERENCES clinical.encounters(id),
        ADD CONSTRAINT fk_orders_ordered_by FOREIGN KEY (ordered_by) REFERENCES core.users(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_orders_type_status ON clinical.orders (tenant_id, order_type, status)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "clinical", "orders");
  }
}
