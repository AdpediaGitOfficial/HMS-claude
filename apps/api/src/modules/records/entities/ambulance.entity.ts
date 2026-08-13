import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type AmbulanceStatus = "available" | "on_trip" | "maintenance";

@Entity({ schema: "records", name: "ambulances" })
@Index(["tenantId"])
export class Ambulance extends TenantScopedEntity {
  @Column({ name: "vehicle_number" })
  vehicleNumber!: string;

  @Column({ name: "driver_name" })
  driverName!: string;

  @Column({ type: "varchar", default: "available" })
  status!: AmbulanceStatus;
}
