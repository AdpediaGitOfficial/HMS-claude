import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

/** One per employee per PayrollRun (§11 companion table) — generated when the run is processed. */
@Entity({ schema: "hr", name: "payslips" })
@Index(["tenantId"])
@Index(["tenantId", "payrollRunId"])
export class Payslip extends TenantScopedEntity {
  @Column({ name: "payroll_run_id", type: "uuid" })
  payrollRunId!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "gross_amount", type: "numeric", precision: 12, scale: 2 })
  grossAmount!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  deductions!: string;

  @Column({ name: "net_amount", type: "numeric", precision: 12, scale: 2 })
  netAmount!: string;
}
