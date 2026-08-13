import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "cancelled";

@Entity({ schema: "billing", name: "invoices" })
@Index(["tenantId"])
@Index(["tenantId", "patientId"])
export class Invoice extends TenantScopedEntity {
  @Column({ name: "encounter_id", type: "uuid" })
  encounterId!: string;

  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ type: "varchar", default: "draft" })
  status!: InvoiceStatus;

  /** Denormalized sum of invoice_lines.amount — recalculated by InvoicesService whenever a line changes. */
  @Column({ name: "total_amount", type: "numeric", precision: 12, scale: 2, default: 0 })
  totalAmount!: string;

  @Column({ name: "issued_at", type: "timestamptz", nullable: true })
  issuedAt?: Date | null;
}
