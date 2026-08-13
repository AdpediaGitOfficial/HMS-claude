import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

/** HR's companion table off core.users (§11) — core.users stays lean; HR-specific fields live here instead. */
@Entity({ schema: "hr", name: "employee_details" })
@Index(["tenantId"])
@Index(["tenantId", "userId"], { unique: true })
export class EmployeeDetail extends TenantScopedEntity {
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column()
  designation!: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ name: "date_of_joining", type: "date" })
  dateOfJoining!: string;

  @Column({ name: "monthly_salary", type: "numeric", precision: 12, scale: 2 })
  monthlySalary!: string;
}
