import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type PaymentMethod = "cash" | "card" | "upi" | "insurance";

@Entity({ schema: "billing", name: "payments" })
@Index(["tenantId"])
@Index(["tenantId", "invoiceId"])
export class Payment extends TenantScopedEntity {
  @Column({ name: "invoice_id", type: "uuid" })
  invoiceId!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: "varchar" })
  method!: PaymentMethod;

  @Column({ name: "recorded_by", type: "uuid" })
  recordedBy!: string;

  @Column({ name: "paid_at", type: "timestamptz" })
  paidAt!: Date;
}
