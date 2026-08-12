import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

@Entity({ schema: "core", name: "role_permissions" })
@Index(["tenantId"])
@Index(["tenantId", "roleId", "permissionId"], { unique: true })
export class RolePermission extends TenantScopedEntity {
  @Column({ name: "role_id", type: "uuid" })
  roleId!: string;

  @Column({ name: "permission_id", type: "uuid" })
  permissionId!: string;
}
