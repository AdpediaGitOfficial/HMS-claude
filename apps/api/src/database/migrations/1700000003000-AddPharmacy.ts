import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

export class AddPharmacy1700000003000 implements MigrationInterface {
  name = "AddPharmacy1700000003000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "pharmacy", "stock_items", `
      name varchar NOT NULL,
      unit varchar NOT NULL,
      quantity_on_hand int NOT NULL DEFAULT 0,
      reorder_level int NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE pharmacy.stock_items
        ADD CONSTRAINT fk_stock_items_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id)
    `);

    await createTenantScopedTable(queryRunner, "pharmacy", "dispense_records", `
      order_id uuid NOT NULL,
      stock_item_id uuid NOT NULL,
      quantity int NOT NULL,
      dispensed_by uuid NOT NULL,
      dispensed_at timestamptz NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE pharmacy.dispense_records
        ADD CONSTRAINT fk_dispense_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_dispense_order FOREIGN KEY (order_id) REFERENCES clinical.orders(id),
        ADD CONSTRAINT fk_dispense_stock_item FOREIGN KEY (stock_item_id) REFERENCES pharmacy.stock_items(id),
        ADD CONSTRAINT fk_dispense_by FOREIGN KEY (dispensed_by) REFERENCES core.users(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "pharmacy", "dispense_records");
    await dropTenantScopedTable(queryRunner, "pharmacy", "stock_items");
  }
}
