import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type PayrollRunStatus = "draft" | "processed";

@Entity({ schema: "hr", name: "payroll_runs" })
@Index(["tenantId"])
@Index(["tenantId", "periodYear", "periodMonth"], { unique: true })
export class PayrollRun extends TenantScopedEntity {
  @Column({ name: "period_month", type: "int" })
  periodMonth!: number; // 1-12

  @Column({ name: "period_year", type: "int" })
  periodYear!: number;

  @Column({ type: "varchar", default: "draft" })
  status!: PayrollRunStatus;

  @Column({ name: "processed_at", type: "timestamptz", nullable: true })
  processedAt?: Date | null;
}
