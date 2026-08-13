import { Column, Entity, Index, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

/**
 * Append-only — no updated_at/deleted_at, entries are never edited or
 * removed. Written once per mutating request by TenantInterceptor
 * (common/tenant/tenant.interceptor.ts) rather than per-service, so every
 * module's writes are covered automatically without each one remembering
 * to log itself.
 */
@Entity({ schema: "core", name: "audit_log" })
@Index(["tenantId"])
@Index(["tenantId", "createdAt"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ name: "actor_id", type: "uuid" })
  actorId!: string;

  @Column()
  method!: string;

  @Column()
  path!: string;

  @Column({ name: "status_code", type: "int" })
  statusCode!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
