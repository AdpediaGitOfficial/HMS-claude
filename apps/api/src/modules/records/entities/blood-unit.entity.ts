import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type BloodUnitStatus = "available" | "reserved" | "issued" | "expired";

@Entity({ schema: "records", name: "blood_units" })
@Index(["tenantId"])
@Index(["tenantId", "bloodType", "status"])
export class BloodUnit extends TenantScopedEntity {
  @Column({ name: "blood_type", type: "varchar" })
  bloodType!: BloodType;

  @Column({ type: "varchar", default: "available" })
  status!: BloodUnitStatus;

  @Column({ name: "collected_at", type: "timestamptz" })
  collectedAt!: Date;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt!: Date;

  @Column({ name: "issued_to_patient_id", type: "uuid", nullable: true })
  issuedToPatientId?: string | null;

  @Column({ name: "issued_at", type: "timestamptz", nullable: true })
  issuedAt?: Date | null;
}
