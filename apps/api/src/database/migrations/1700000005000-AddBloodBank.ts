import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

export class AddBloodBank1700000005000 implements MigrationInterface {
  name = "AddBloodBank1700000005000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "records", "blood_units", `
      blood_type varchar NOT NULL,
      status varchar NOT NULL DEFAULT 'available',
      collected_at timestamptz NOT NULL,
      expires_at timestamptz NOT NULL,
      issued_to_patient_id uuid,
      issued_at timestamptz
    `);
    await queryRunner.query(`
      ALTER TABLE records.blood_units
        ADD CONSTRAINT fk_blood_units_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_blood_units_patient FOREIGN KEY (issued_to_patient_id) REFERENCES core.patients(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_blood_units_type_status ON records.blood_units (tenant_id, blood_type, status)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "records", "blood_units");
  }
}
