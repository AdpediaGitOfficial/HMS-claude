import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

/**
 * Clinical core (§9 step 2): Appointments -> Encounters (the Visit spine
 * entity promised in §11) -> EHR clinical notes -> IPD bed management.
 * Purely additive — nothing in InitCoreSpine changes. Every new table
 * here is a leaf hanging off Tenant/Patient/User via a foreign key, per
 * the companion-table extension mechanism.
 */
export class AddClinicalCore1700000001000 implements MigrationInterface {
  name = "AddClinicalCore1700000001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---- clinical.appointments ----
    await createTenantScopedTable(queryRunner, "clinical", "appointments", `
      patient_id uuid NOT NULL,
      doctor_id uuid NOT NULL,
      branch_id uuid,
      department varchar,
      scheduled_at timestamptz NOT NULL,
      status varchar NOT NULL DEFAULT 'booked',
      notes varchar
    `);
    await queryRunner.query(`
      ALTER TABLE clinical.appointments
        ADD CONSTRAINT fk_appointments_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES core.patients(id),
        ADD CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES core.users(id),
        ADD CONSTRAINT fk_appointments_branch FOREIGN KEY (branch_id) REFERENCES platform.branches(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_appointments_scheduled ON clinical.appointments (tenant_id, scheduled_at)`);

    // ---- clinical.encounters — the Visit spine (§11) ----
    await createTenantScopedTable(queryRunner, "clinical", "encounters", `
      patient_id uuid NOT NULL,
      provider_id uuid,
      branch_id uuid,
      appointment_id uuid,
      type varchar NOT NULL,
      status varchar NOT NULL DEFAULT 'in_progress',
      department varchar,
      started_at timestamptz NOT NULL,
      ended_at timestamptz
    `);
    await queryRunner.query(`
      ALTER TABLE clinical.encounters
        ADD CONSTRAINT fk_encounters_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_encounters_patient FOREIGN KEY (patient_id) REFERENCES core.patients(id),
        ADD CONSTRAINT fk_encounters_provider FOREIGN KEY (provider_id) REFERENCES core.users(id),
        ADD CONSTRAINT fk_encounters_branch FOREIGN KEY (branch_id) REFERENCES platform.branches(id),
        ADD CONSTRAINT fk_encounters_appointment FOREIGN KEY (appointment_id) REFERENCES clinical.appointments(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_encounters_patient ON clinical.encounters (tenant_id, patient_id)`);

    // ---- clinical.clinical_notes — EHR companion table off Encounter ----
    await createTenantScopedTable(queryRunner, "clinical", "clinical_notes", `
      encounter_id uuid NOT NULL,
      authored_by uuid NOT NULL,
      vitals jsonb NOT NULL DEFAULT '{}',
      diagnosis text,
      prescription text,
      notes text
    `);
    await queryRunner.query(`
      ALTER TABLE clinical.clinical_notes
        ADD CONSTRAINT fk_clinical_notes_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_clinical_notes_encounter FOREIGN KEY (encounter_id) REFERENCES clinical.encounters(id),
        ADD CONSTRAINT fk_clinical_notes_author FOREIGN KEY (authored_by) REFERENCES core.users(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_clinical_notes_encounter ON clinical.clinical_notes (tenant_id, encounter_id)`);

    // ---- clinical.wards ----
    await createTenantScopedTable(queryRunner, "clinical", "wards", `
      branch_id uuid,
      name varchar NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE clinical.wards
        ADD CONSTRAINT fk_wards_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_wards_branch FOREIGN KEY (branch_id) REFERENCES platform.branches(id)
    `);

    // ---- clinical.beds ----
    await createTenantScopedTable(queryRunner, "clinical", "beds", `
      ward_id uuid NOT NULL,
      label varchar NOT NULL,
      status varchar NOT NULL DEFAULT 'available'
    `);
    await queryRunner.query(`
      ALTER TABLE clinical.beds
        ADD CONSTRAINT fk_beds_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_beds_ward FOREIGN KEY (ward_id) REFERENCES clinical.wards(id)
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_beds_ward_label ON clinical.beds (tenant_id, ward_id, label)`);

    // ---- clinical.admissions ----
    await createTenantScopedTable(queryRunner, "clinical", "admissions", `
      patient_id uuid NOT NULL,
      encounter_id uuid NOT NULL,
      bed_id uuid NOT NULL,
      admitted_at timestamptz NOT NULL,
      discharged_at timestamptz,
      discharge_summary text,
      status varchar NOT NULL DEFAULT 'admitted'
    `);
    await queryRunner.query(`
      ALTER TABLE clinical.admissions
        ADD CONSTRAINT fk_admissions_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_admissions_patient FOREIGN KEY (patient_id) REFERENCES core.patients(id),
        ADD CONSTRAINT fk_admissions_encounter FOREIGN KEY (encounter_id) REFERENCES clinical.encounters(id),
        ADD CONSTRAINT fk_admissions_bed FOREIGN KEY (bed_id) REFERENCES clinical.beds(id)
    `);
    // A bed can only have one active admission at a time — enforced at the
    // DB layer, not just application logic, via a partial unique index.
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_admissions_active_bed ON clinical.admissions (bed_id) WHERE status = 'admitted'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "clinical", "admissions");
    await dropTenantScopedTable(queryRunner, "clinical", "beds");
    await dropTenantScopedTable(queryRunner, "clinical", "wards");
    await dropTenantScopedTable(queryRunner, "clinical", "clinical_notes");
    await dropTenantScopedTable(queryRunner, "clinical", "encounters");
    await dropTenantScopedTable(queryRunner, "clinical", "appointments");
  }
}
