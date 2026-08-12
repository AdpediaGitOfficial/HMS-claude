import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type AdmissionStatus = "admitted" | "discharged";

@Entity({ schema: "clinical", name: "admissions" })
@Index(["tenantId"])
@Index(["tenantId", "patientId"])
export class Admission extends TenantScopedEntity {
  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "encounter_id", type: "uuid" })
  encounterId!: string;

  @Column({ name: "bed_id", type: "uuid" })
  bedId!: string;

  @Column({ name: "admitted_at", type: "timestamptz" })
  admittedAt!: Date;

  @Column({ name: "discharged_at", type: "timestamptz", nullable: true })
  dischargedAt?: Date | null;

  @Column({ name: "discharge_summary", type: "text", nullable: true })
  dischargeSummary?: string;

  @Column({ type: "varchar", default: "admitted" })
  status!: AdmissionStatus;
}
