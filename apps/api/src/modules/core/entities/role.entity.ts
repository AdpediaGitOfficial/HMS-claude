import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

/**
 * Every tenant gets its own copy of the standard roles (seeded on tenant
 * onboarding from ROLE_MODULES in @hms/shared), plus can add custom ones —
 * keeps tenant_id NOT NULL uniform across every table (§11) instead of a
 * nullable "global row" special case.
 */
@Entity({ schema: "core", name: "roles" })
@Index(["tenantId"])
export class Role extends TenantScopedEntity {
  @Column()
  key!: string; // e.g. "doctor", "accountant"

  @Column()
  name!: string;
}
