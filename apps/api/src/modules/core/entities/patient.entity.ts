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

  @Column({ name: "guardian_name", nullable: true })
  guardianName?: string;

  @Column({ name: "blood_group", nullable: true })
  bloodGroup?: string;

  @Column({ name: "marital_status", nullable: true })
  maritalStatus?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ name: "national_id", nullable: true })
  nationalId?: string;

  @Column({ name: "photo_url", nullable: true })
  photoUrl?: string;

  @Column({ nullable: true })
  remarks?: string;

  @Column({ nullable: true })
  allergies?: string;

  /** FK into billing.tpa_providers — the tenant's insurer/TPA catalog, not a free-text name (see AddTpaProviders migration). */
  @Column({ name: "tpa_provider_id", type: "uuid", nullable: true })
  tpaProviderId?: string | null;

  /** The patient's member/beneficiary number under that provider — patient-specific, not a lookup value. */
  @Column({ name: "tpa_id", type: "varchar", nullable: true })
  tpaId?: string | null;

  @Column({ name: "tpa_validity", type: "date", nullable: true })
  tpaValidity?: string | null;

  @Column({ name: "alternate_phone", nullable: true })
  alternatePhone?: string;

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
