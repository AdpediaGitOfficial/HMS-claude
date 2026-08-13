import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type AmbulanceTripStatus = "dispatched" | "completed" | "cancelled";

@Entity({ schema: "records", name: "ambulance_trips" })
@Index(["tenantId"])
@Index(["tenantId", "ambulanceId"])
export class AmbulanceTrip extends TenantScopedEntity {
  @Column({ name: "ambulance_id", type: "uuid" })
  ambulanceId!: string;

  @Column({ name: "patient_id", type: "uuid", nullable: true })
  patientId?: string | null;

  @Column({ name: "pickup_location" })
  pickupLocation!: string;

  @Column({ name: "drop_location" })
  dropLocation!: string;

  @Column({ name: "dispatched_at", type: "timestamptz" })
  dispatchedAt!: Date;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt?: Date | null;

  @Column({ type: "varchar", default: "dispatched" })
  status!: AmbulanceTripStatus;
}
