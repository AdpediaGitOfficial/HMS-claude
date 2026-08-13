import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

@Entity({ schema: "records", name: "death_records" })
@Index(["tenantId"])
@Index(["tenantId", "patientId"])
export class DeathRecord extends TenantScopedEntity {
  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "date_of_death", type: "date" })
  dateOfDeath!: string;

  @Column({ name: "cause_of_death" })
  causeOfDeath!: string;

  @Column({ name: "certifying_doctor_id", type: "uuid" })
  certifyingDoctorId!: string;
}
