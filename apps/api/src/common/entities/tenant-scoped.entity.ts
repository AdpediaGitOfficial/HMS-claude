import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Base for every tenant-owned table (§11 conventions):
 *  - UUID primary key
 *  - tenant_id, always present and always indexed by the migration that
 *    creates the concrete table's RLS policy
 *  - full audit trail, soft delete via deletedAt (clinical/financial rows
 *    are never hard-deleted)
 *
 * A module's own entity extends this and adds nothing else that other
 * modules don't already get for free — extension happens in the module's
 * *own* table (companion-table pattern), never by editing this base.
 */
export abstract class TenantScopedEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy?: string | null;

  @Column({ name: "updated_by", type: "uuid", nullable: true })
  updatedBy?: string | null;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt?: Date | null;
}
