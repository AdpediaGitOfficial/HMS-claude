import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Extends core.patients for the full Add Patient form (§11 extension
 * mechanism: new, nullable columns, no rename/drop of anything
 * InitCoreSpine shipped). tpa_provider_id is a real FK into
 * billing.tpa_providers (previous migration) rather than a free-text
 * insurer name — that's what makes "TPA" a real relation instead of a
 * disconnected field. tpa_id (the patient's member/beneficiary number
 * under that provider) and tpa_validity stay plain columns: they're
 * patient-specific values, not something to look up.
 */
export class AddPatientDetails1700000013000 implements MigrationInterface {
  name = "AddPatientDetails1700000013000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE core.patients
        ADD COLUMN guardian_name varchar,
        ADD COLUMN blood_group varchar,
        ADD COLUMN marital_status varchar,
        ADD COLUMN email varchar,
        ADD COLUMN address varchar,
        ADD COLUMN national_id varchar,
        ADD COLUMN photo_url varchar,
        ADD COLUMN remarks varchar,
        ADD COLUMN allergies varchar,
        ADD COLUMN tpa_provider_id uuid,
        ADD COLUMN tpa_id varchar,
        ADD COLUMN tpa_validity date,
        ADD COLUMN alternate_phone varchar
    `);
    await queryRunner.query(`
      ALTER TABLE core.patients
        ADD CONSTRAINT fk_patients_tpa_provider FOREIGN KEY (tpa_provider_id) REFERENCES billing.tpa_providers(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_patients_tpa_provider ON core.patients (tpa_provider_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE core.patients
        DROP CONSTRAINT IF EXISTS fk_patients_tpa_provider,
        DROP COLUMN IF EXISTS guardian_name,
        DROP COLUMN IF EXISTS blood_group,
        DROP COLUMN IF EXISTS marital_status,
        DROP COLUMN IF EXISTS email,
        DROP COLUMN IF EXISTS address,
        DROP COLUMN IF EXISTS national_id,
        DROP COLUMN IF EXISTS photo_url,
        DROP COLUMN IF EXISTS remarks,
        DROP COLUMN IF EXISTS allergies,
        DROP COLUMN IF EXISTS tpa_provider_id,
        DROP COLUMN IF EXISTS tpa_id,
        DROP COLUMN IF EXISTS tpa_validity,
        DROP COLUMN IF EXISTS alternate_phone
    `);
  }
}
