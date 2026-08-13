import { MigrationInterface, QueryRunner } from "typeorm";
import { createTenantScopedTable, dropTenantScopedTable } from "../migration-helpers";

export class AddHr1700000008000 implements MigrationInterface {
  name = "AddHr1700000008000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTenantScopedTable(queryRunner, "hr", "employee_details", `
      user_id uuid NOT NULL,
      designation varchar NOT NULL,
      department varchar,
      date_of_joining date NOT NULL,
      monthly_salary numeric(12,2) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE hr.employee_details
        ADD CONSTRAINT fk_employee_details_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_employee_details_user FOREIGN KEY (user_id) REFERENCES core.users(id)
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_employee_details_user ON hr.employee_details (tenant_id, user_id)`);

    await createTenantScopedTable(queryRunner, "hr", "attendance", `
      user_id uuid NOT NULL,
      date date NOT NULL,
      status varchar NOT NULL,
      marked_by uuid NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE hr.attendance
        ADD CONSTRAINT fk_attendance_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES core.users(id),
        ADD CONSTRAINT fk_attendance_marked_by FOREIGN KEY (marked_by) REFERENCES core.users(id)
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_attendance_user_date ON hr.attendance (tenant_id, user_id, date)`);

    await createTenantScopedTable(queryRunner, "hr", "payroll_runs", `
      period_month int NOT NULL,
      period_year int NOT NULL,
      status varchar NOT NULL DEFAULT 'draft',
      processed_at timestamptz
    `);
    await queryRunner.query(`
      ALTER TABLE hr.payroll_runs
        ADD CONSTRAINT fk_payroll_runs_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_payroll_runs_period ON hr.payroll_runs (tenant_id, period_year, period_month)
    `);

    await createTenantScopedTable(queryRunner, "hr", "payslips", `
      payroll_run_id uuid NOT NULL,
      user_id uuid NOT NULL,
      gross_amount numeric(12,2) NOT NULL,
      deductions numeric(12,2) NOT NULL DEFAULT 0,
      net_amount numeric(12,2) NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE hr.payslips
        ADD CONSTRAINT fk_payslips_tenant FOREIGN KEY (tenant_id) REFERENCES platform.tenants(id),
        ADD CONSTRAINT fk_payslips_run FOREIGN KEY (payroll_run_id) REFERENCES hr.payroll_runs(id),
        ADD CONSTRAINT fk_payslips_user FOREIGN KEY (user_id) REFERENCES core.users(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropTenantScopedTable(queryRunner, "hr", "payslips");
    await dropTenantScopedTable(queryRunner, "hr", "payroll_runs");
    await dropTenantScopedTable(queryRunner, "hr", "attendance");
    await dropTenantScopedTable(queryRunner, "hr", "employee_details");
  }
}
