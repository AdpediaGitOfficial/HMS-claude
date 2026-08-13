import { Column, Entity, Index } from "typeorm";
import { TenantScopedEntity } from "../../../common/entities/tenant-scoped.entity";

export type TestCategory = "lab" | "radiology";

@Entity({ schema: "lab", name: "test_catalog" })
@Index(["tenantId"])
export class TestCatalog extends TenantScopedEntity {
  @Column()
  name!: string; // "CBC", "Chest X-Ray"

  @Column({ type: "varchar" })
  category!: TestCategory;
}
