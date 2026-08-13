import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type ReferralStatus = "pending" | "accepted" | "completed";

@Entity({ schema: "records", name: "referrals" })
@Index(["tenantId"])
@Index(["tenantId", "patientId"])
export class Referral extends TenantScopedEntity {
  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "referring_doctor_id", type: "uuid" })
  referringDoctorId!: string;

  @Column({ name: "external_doctor_name", nullable: true })
  externalDoctorName?: string;

  @Column({ name: "external_clinic_name", nullable: true })
  externalClinicName?: string;

  @Column()
  reason!: string;

  @Column({ type: "varchar", default: "pending" })
  status!: ReferralStatus;

  @Column({ name: "referred_at", type: "timestamptz" })
  referredAt!: Date;
}
