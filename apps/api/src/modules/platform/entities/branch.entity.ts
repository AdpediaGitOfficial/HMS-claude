import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

/** One physical location under a Tenant (§11 — covers "Multi Branch" as data, not a module). */
@Entity({ schema: "platform", name: "branches" })
@Index(["tenantId"])
export class Branch extends TenantScopedEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ name: "is_primary", default: false })
  isPrimary!: boolean;
}
