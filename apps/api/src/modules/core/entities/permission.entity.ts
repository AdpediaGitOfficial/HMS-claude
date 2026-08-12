import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Global catalog, no tenant_id — a permission is a code-level constant
 * ("billing.invoice.create"), identical across every tenant. New modules
 * add rows here as part of their own migration (§11); nothing else in the
 * schema needs to change for a new module's permissions to exist.
 */
@Entity({ schema: "core", name: "permissions" })
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  module!: string; // e.g. "billing"

  @Column()
  action!: string; // e.g. "invoice.create"

  @Column({ nullable: true })
  description?: string;
}
