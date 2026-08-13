import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

@Entity({ schema: "records", name: "birth_records" })
@Index(["tenantId"])
export class BirthRecord extends TenantScopedEntity {
  /** The mother's patient record, when she was a registered patient for the delivery. */
  @Column({ name: "mother_patient_id", type: "uuid", nullable: true })
  motherPatientId?: string | null;

  @Column({ name: "baby_name", nullable: true })
  babyName?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ name: "date_of_birth", type: "date" })
  dateOfBirth!: string;

  @Column({ name: "weight_kg", type: "numeric", precision: 5, scale: 2, nullable: true })
  weightKg?: string;

  @Column({ name: "attending_doctor_id", type: "uuid" })
  attendingDoctorId!: string;
}
