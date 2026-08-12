import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

@Entity({ schema: "clinical", name: "wards" })
@Index(["tenantId"])
export class Ward extends TenantScopedEntity {
  @Column({ name: "branch_id", type: "uuid", nullable: true })
  branchId?: string | null;

  @Column()
  name!: string; // "General", "ICU", "Maternity", "Pediatric"
}
