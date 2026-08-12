import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type BedStatus = "available" | "occupied" | "maintenance";

@Entity({ schema: "clinical", name: "beds" })
@Index(["tenantId"])
@Index(["tenantId", "wardId"])
export class Bed extends TenantScopedEntity {
  @Column({ name: "ward_id", type: "uuid" })
  wardId!: string;

  @Column()
  label!: string; // "B-14"

  @Column({ type: "varchar", default: "available" })
  status!: BedStatus;
}
