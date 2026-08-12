import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

@Entity({ schema: "core", name: "patients" })
@Index(["tenantId"])
@Index(["tenantId", "mrn"], { unique: true })
export class Patient extends TenantScopedEntity {
  @Column({ name: "branch_id", type: "uuid", nullable: true })
  branchId?: string | null;

  /** Medical record number — human-facing identifier, unique per tenant. */
  @Column()
  mrn!: string;

  @Column()
  name!: string;

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  phone?: string;

  /**
   * Zero-migration extension point (§11): a future module or a
   * tenant-specific field lands here first, and graduates to a real
   * column only if it turns out to need indexing/validation at the DB
   * layer. Never the first choice for anything that's really its own
   * entity — that's a companion table instead.
   */
  @Column({ name: "custom_attributes", type: "jsonb", default: {} })
  customAttributes!: Record<string, unknown>;
}
