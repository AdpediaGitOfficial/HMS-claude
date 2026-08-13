import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

export class AddAmbulance1700000009000 implements MigrationInterface {
  name = "AddAmbulance1700000009000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "records", "ambulances", `
      vehicle_number varchar NOT NULL,
      driver_name varchar NOT NULL,
      status varchar NOT NULL DEFAULT 'available'
    `);
    await queryRunner.query(`
      ALTER TABLE records.ambulances
        ADD CONSTRAINT fk_ambulances_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id)
    `);

    await createTenantScopedTable(queryRunner, "records", "ambulance_trips", `
      ambulance_id uuid NOT NULL,
      patient_id uuid,
      pickup_location varchar NOT NULL,
      drop_location varchar NOT NULL,
      dispatched_at timestamptz NOT NULL,
      completed_at timestamptz,
      status varchar NOT NULL DEFAULT 'dispatched'
    `);
    await queryRunner.query(`
      ALTER TABLE records.ambulance_trips
        ADD CONSTRAINT fk_ambulance_trips_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_ambulance_trips_ambulance FOREIGN KEY (ambulance_id) REFERENCES records.ambulances(id),
        ADD CONSTRAINT fk_ambulance_trips_patient FOREIGN KEY (patient_id) REFERENCES core.patients(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "records", "ambulance_trips");
    await dropTenantScopedTable(queryRunner, "records", "ambulances");
  }
}
