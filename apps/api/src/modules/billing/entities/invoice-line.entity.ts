import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

@Entity({ schema: "billing", name: "invoice_lines" })
@Index(["tenantId"])
@Index(["tenantId", "invoiceId"])
export class InvoiceLine extends TenantScopedEntity {
  @Column({ name: "invoice_id", type: "uuid" })
  invoiceId!: string;

  /** Optional link back to the Order this charge came from (§11 companion pattern) — nullable for manual line items like a consultation fee. */
  @Column({ name: "order_id", type: "uuid", nullable: true })
  orderId?: string | null;

  @Column()
  description!: string;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @Column({ name: "unit_price", type: "numeric", precision: 12, scale: 2 })
  unitPrice!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount!: string;
}
