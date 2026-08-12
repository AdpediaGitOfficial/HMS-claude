import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

@Entity({ schema: "core", name: "users" })
@Index(["tenantId"])
@Index(["tenantId", "email"], { unique: true })
export class User extends TenantScopedEntity {
  @Column({ name: "branch_id", type: "uuid", nullable: true })
  branchId?: string | null;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @Column({ default: "active" })
  status!: "active" | "disabled";
}
