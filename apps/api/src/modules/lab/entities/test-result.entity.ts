import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type TestResultStatus = "pending" | "completed";

/** Fulfils a lab/radiology Order (§11 companion-table pattern). */
@Entity({ schema: "lab", name: "test_results" })
@Index(["tenantId"])
@Index(["tenantId", "orderId"])
export class TestResult extends TenantScopedEntity {
  @Column({ name: "order_id", type: "uuid" })
  orderId!: string;

  @Column({ name: "test_catalog_id", type: "uuid" })
  testCatalogId!: string;

  @Column({ name: "result_value", type: "text", nullable: true })
  resultValue?: string;

  @Column({ name: "result_status", type: "varchar", default: "pending" })
  resultStatus!: TestResultStatus;

  @Column({ name: "reported_by", type: "uuid", nullable: true })
  reportedBy?: string | null;

  @Column({ name: "reported_at", type: "timestamptz", nullable: true })
  reportedAt?: Date | null;
}
