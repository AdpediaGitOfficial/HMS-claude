import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

@Entity({ schema: "core", name: "user_roles" })
@Index(["tenantId"])
@Index(["tenantId", "userId", "roleId"], { unique: true })
export class UserRole extends TenantScopedEntity {
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "role_id", type: "uuid" })
  roleId!: string;
}
