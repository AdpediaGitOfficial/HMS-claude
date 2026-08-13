import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type OrderType = "pharmacy" | "lab" | "radiology";
export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

/**
 * The generic "something requested during a visit" spine entity from
 * §11 — Pharmacy, Lab, and Radiology each fulfil an Order via their own
 * companion table (dispense_records, test_results) rather than Order
 * growing type-specific columns. A new order-fulfilling module later
 * (e.g. Procedures) is just another companion table + a new OrderType.
 */
@Entity({ schema: "clinical", name: "orders" })
@Index(["tenantId"])
@Index(["tenantId", "encounterId"])
export class Order extends TenantScopedEntity {
  @Column({ name: "encounter_id", type: "uuid" })
  encounterId!: string;

  @Column({ name: "order_type", type: "varchar" })
  orderType!: OrderType;

  @Column({ type: "varchar", default: "pending" })
  status!: OrderStatus;

  @Column({ name: "ordered_by", type: "uuid" })
  orderedBy!: string;

  @Column({ name: "ordered_at", type: "timestamptz" })
  orderedAt!: Date;

  @Column({ type: "text", nullable: true })
  notes?: string;
}
