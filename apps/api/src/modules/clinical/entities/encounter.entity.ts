import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type EncounterType = "opd" | "ipd";
export type EncounterStatus = "in_progress" | "completed" | "cancelled";

/**
 * The "Visit" spine entity from §11 — every clinical/financial module
 * (EHR notes, Admissions, Orders, Billing) references an Encounter,
 * never the other way around. Created by check-in (from an Appointment,
 * or as a walk-in) and closed out when the visit/stay ends.
 */
@Entity({ schema: "clinical", name: "encounters" })
@Index(["tenantId"])
@Index(["tenantId", "patientId"])
export class Encounter extends TenantScopedEntity {
  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "provider_id", type: "uuid", nullable: true })
  providerId?: string | null;

  @Column({ name: "branch_id", type: "uuid", nullable: true })
  branchId?: string | null;

  @Column({ name: "appointment_id", type: "uuid", nullable: true })
  appointmentId?: string | null;

  @Column({ type: "varchar" })
  type!: EncounterType;

  @Column({ type: "varchar", default: "in_progress" })
  status!: EncounterStatus;

  @Column({ name: "department", type: "varchar", nullable: true })
  department?: string;

  @Column({ name: "started_at", type: "timestamptz" })
  startedAt!: Date;

  @Column({ name: "ended_at", type: "timestamptz", nullable: true })
  endedAt?: Date | null;
}
