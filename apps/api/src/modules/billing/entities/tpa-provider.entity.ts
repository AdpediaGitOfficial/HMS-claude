import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

/** The insurer/TPA catalog a tenant maintains — see core.patients.tpaProviderId and the AddTpaProviders migration for why this is a real table, not a free-text field. */
@Entity({ schema: "billing", name: "tpa_providers" })
@Index(["tenantId"])
export class TpaProvider extends TenantScopedEntity {
  @Column()
  name!: string; // "Star Health Insurance"

  @Column({ name: "contact_phone", nullable: true })
  contactPhone?: string;

  @Column({ name: "contact_email", nullable: true })
  contactEmail?: string;
}
