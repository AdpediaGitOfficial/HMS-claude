import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

export class AddVitalRecords1700000011000 implements MigrationInterface {
  name = "AddVitalRecords1700000011000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "records", "birth_records", `
      mother_patient_id uuid,
      baby_name varchar,
      gender varchar,
      date_of_birth date NOT NULL,
      weight_kg numeric(5,2),
      attending_doctor_id uuid NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE records.birth_records
        ADD CONSTRAINT fk_birth_records_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_birth_records_mother FOREIGN KEY (mother_patient_id) REFERENCES core.patients(id),
        ADD CONSTRAINT fk_birth_records_doctor FOREIGN KEY (attending_doctor_id) REFERENCES core.users(id)
    `);

    await createTenantScopedTable(queryRunner, "records", "death_records", `
      patient_id uuid NOT NULL,
      date_of_death date NOT NULL,
      cause_of_death varchar NOT NULL,
      certifying_doctor_id uuid NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE records.death_records
        ADD CONSTRAINT fk_death_records_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_death_records_patient FOREIGN KEY (patient_id) REFERENCES core.patients(id),
        ADD CONSTRAINT fk_death_records_doctor FOREIGN KEY (certifying_doctor_id) REFERENCES core.users(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "records", "death_records");
    await dropTenantScopedTable(queryRunner, "records", "birth_records");
  }
}
