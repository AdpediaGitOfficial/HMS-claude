import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export type TenantStatus = "active" | "suspended" | "trial";

/**
 * The one table with no tenant_id — everything else references *this*.
 * Lives outside RLS entirely; access to platform.tenants is restricted at
 * the application layer (super_admin role only), not by a Postgres policy.
 */
@Entity({ schema: "platform", name: "tenants" })
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ default: "trial" })
  plan!: string;

  @Column({ type: "varchar", default: "trial" })
  status!: TenantStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
