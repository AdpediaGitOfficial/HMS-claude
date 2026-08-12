import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type AppointmentStatus = "booked" | "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show";

@Entity({ schema: "clinical", name: "appointments" })
@Index(["tenantId"])
@Index(["tenantId", "scheduledAt"])
export class Appointment extends TenantScopedEntity {
  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "doctor_id", type: "uuid" })
  doctorId!: string;

  @Column({ name: "branch_id", type: "uuid", nullable: true })
  branchId?: string | null;

  @Column({ nullable: true })
  department?: string;

  @Column({ name: "scheduled_at", type: "timestamptz" })
  scheduledAt!: Date;

  @Column({ type: "varchar", default: "booked" })
  status!: AppointmentStatus;

  @Column({ nullable: true })
  notes?: string;
}
