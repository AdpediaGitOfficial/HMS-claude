import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

@Entity({ schema: "pharmacy", name: "stock_items" })
@Index(["tenantId"])
export class StockItem extends TenantScopedEntity {
  @Column()
  name!: string; // "Paracetamol 500mg"

  @Column()
  unit!: string; // "tablet", "ml", "vial"

  @Column({ name: "quantity_on_hand", type: "int", default: 0 })
  quantityOnHand!: number;

  @Column({ name: "reorder_level", type: "int", default: 0 })
  reorderLevel!: number;
}
