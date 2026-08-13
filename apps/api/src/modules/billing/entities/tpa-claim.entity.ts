import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type TpaClaimStatus = "submitted" | "approved" | "rejected" | "settled";

@Entity({ schema: "billing", name: "tpa_claims" })
@Index(["tenantId"])
@Index(["tenantId", "invoiceId"])
export class TpaClaim extends TenantScopedEntity {
  @Column({ name: "invoice_id", type: "uuid" })
  invoiceId!: string;

  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "insurer_name" })
  insurerName!: string;

  @Column({ name: "policy_number" })
  policyNumber!: string;

  @Column({ name: "claimed_amount", type: "numeric", precision: 12, scale: 2 })
  claimedAmount!: string;

  @Column({ name: "approved_amount", type: "numeric", precision: 12, scale: 2, nullable: true })
  approvedAmount?: string | null;

  @Column({ type: "varchar", default: "submitted" })
  status!: TpaClaimStatus;

  @Column({ name: "submitted_at", type: "timestamptz" })
  submittedAt!: Date;

  @Column({ name: "resolved_at", type: "timestamptz", nullable: true })
  resolvedAt?: Date | null;
}
