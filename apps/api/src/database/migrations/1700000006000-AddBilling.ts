import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

/** Financial modules (§9 step 4): Billing & Finance and Insurance/TPA Claims, both in the `billing` schema (§3 groups them under Finance). */
export class AddBilling1700000006000 implements MigrationInterface {
  name = "AddBilling1700000006000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "billing", "invoices", `
      encounter_id uuid NOT NULL,
      patient_id uuid NOT NULL,
      status varchar NOT NULL DEFAULT 'draft',
      total_amount numeric(12,2) NOT NULL DEFAULT 0,
      issued_at timestamptz
    `);
    await queryRunner.query(`
      ALTER TABLE billing.invoices
        ADD CONSTRAINT fk_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_invoices_encounter FOREIGN KEY (encounter_id) REFERENCES clinical.encounters(id),
        ADD CONSTRAINT fk_invoices_patient FOREIGN KEY (patient_id) REFERENCES core.patients(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_invoices_status ON billing.invoices (tenant_id, status)`);

    await createTenantScopedTable(queryRunner, "billing", "invoice_lines", `
      invoice_id uuid NOT NULL,
      order_id uuid,
      description varchar NOT NULL,
      quantity int NOT NULL DEFAULT 1,
      unit_price numeric(12,2) NOT NULL,
      amount numeric(12,2) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE billing.invoice_lines
        ADD CONSTRAINT fk_invoice_lines_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_invoice_lines_invoice FOREIGN KEY (invoice_id) REFERENCES billing.invoices(id),
        ADD CONSTRAINT fk_invoice_lines_order FOREIGN KEY (order_id) REFERENCES clinical.orders(id)
    `);

    await createTenantScopedTable(queryRunner, "billing", "payments", `
      invoice_id uuid NOT NULL,
      amount numeric(12,2) NOT NULL,
      method varchar NOT NULL,
      recorded_by uuid NOT NULL,
      paid_at timestamptz NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE billing.payments
        ADD CONSTRAINT fk_payments_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES billing.invoices(id),
        ADD CONSTRAINT fk_payments_recorded_by FOREIGN KEY (recorded_by) REFERENCES core.users(id)
    `);

    await createTenantScopedTable(queryRunner, "billing", "tpa_claims", `
      invoice_id uuid NOT NULL,
      patient_id uuid NOT NULL,
      insurer_name varchar NOT NULL,
      policy_number varchar NOT NULL,
      claimed_amount numeric(12,2) NOT NULL,
      approved_amount numeric(12,2),
      status varchar NOT NULL DEFAULT 'submitted',
      submitted_at timestamptz NOT NULL,
      resolved_at timestamptz
    `);
    await queryRunner.query(`
      ALTER TABLE billing.tpa_claims
        ADD CONSTRAINT fk_tpa_claims_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_tpa_claims_invoice FOREIGN KEY (invoice_id) REFERENCES billing.invoices(id),
        ADD CONSTRAINT fk_tpa_claims_patient FOREIGN KEY (patient_id) REFERENCES core.patients(id)
    `);
    await queryRunner.query(`CREATE INDEX idx_tpa_claims_status ON billing.tpa_claims (tenant_id, status)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "billing", "tpa_claims");
    await dropTenantScopedTable(queryRunner, "billing", "payments");
    await dropTenantScopedTable(queryRunner, "billing", "invoice_lines");
    await dropTenantScopedTable(queryRunner, "billing", "invoices");
  }
}
