import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

export class AddReferral1700000010000 implements MigrationInterface {
  name = "AddReferral1700000010000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "records", "referrals", `
      patient_id uuid NOT NULL,
      referring_doctor_id uuid NOT NULL,
      external_doctor_name varchar,
      external_clinic_name varchar,
      reason varchar NOT NULL,
      status varchar NOT NULL DEFAULT 'pending',
      referred_at timestamptz NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE records.referrals
        ADD CONSTRAINT fk_referrals_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_referrals_patient FOREIGN KEY (patient_id) REFERENCES core.patients(id),
        ADD CONSTRAINT fk_referrals_doctor FOREIGN KEY (referring_doctor_id) REFERENCES core.users(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "records", "referrals");
  }
}
