import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

/** Fulfils a pharmacy Order (§11 companion-table pattern) — Order itself never grew pharmacy-specific columns. */
@Entity({ schema: "pharmacy", name: "dispense_records" })
@Index(["tenantId"])
@Index(["tenantId", "orderId"])
export class DispenseRecord extends TenantScopedEntity {
  @Column({ name: "order_id", type: "uuid" })
  orderId!: string;

  @Column({ name: "stock_item_id", type: "uuid" })
  stockItemId!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ name: "dispensed_by", type: "uuid" })
  dispensedBy!: string;

  @Column({ name: "dispensed_at", type: "timestamptz" })
  dispensedAt!: Date;
}
