import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type AttendanceStatus = "present" | "absent" | "leave" | "half_day";

@Entity({ schema: "hr", name: "attendance" })
@Index(["tenantId"])
@Index(["tenantId", "userId", "date"], { unique: true })
export class Attendance extends TenantScopedEntity {
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "varchar" })
  status!: AttendanceStatus;

  @Column({ name: "marked_by", type: "uuid" })
  markedBy!: string;
}
