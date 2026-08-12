import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

/**
 * The EHR module's companion table off Encounter (§11 extension
 * mechanism) — Encounter itself never grew a "diagnosis" or "vitals"
 * column for this; EHR just references encounter_id.
 */
@Entity({ schema: "clinical", name: "clinical_notes" })
@Index(["tenantId"])
@Index(["tenantId", "encounterId"])
export class ClinicalNote extends TenantScopedEntity {
  @Column({ name: "encounter_id", type: "uuid" })
  encounterId!: string;

  @Column({ name: "authored_by", type: "uuid" })
  authoredBy!: string;

  /** Structured key/value vitals (temp, bp, pulse, spo2, ...) — jsonb since the exact set varies by department. */
  @Column({ type: "jsonb", default: {} })
  vitals!: Record<string, string | number>;

  @Column({ type: "text", nullable: true })
  diagnosis?: string;

  @Column({ type: "text", nullable: true })
  prescription?: string;

  @Column({ type: "text", nullable: true })
  notes?: string;
}
