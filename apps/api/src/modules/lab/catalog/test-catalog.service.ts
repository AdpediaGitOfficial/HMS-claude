import { Injectable } from "@nestjs/common";
import { TestCatalog, TestCategory } from "../entities/test-catalog.entity";
import { CreateTestCatalogDto } from "../dto/create-test-catalog.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class TestCatalogService {
  async list(category?: TestCategory) {
    return tenantManager()
      .getRepository(TestCatalog)
      .find({ where: category ? { category } : {}, order: { name: "ASC" } });
  }

  async create(dto: CreateTestCatalogDto): Promise<TestCatalog> {
    const repo = tenantManager().getRepository(TestCatalog);
    const item = repo.create({ ...dto, tenantId: currentTenantId(), createdBy: currentUserId(), updatedBy: currentUserId() });
    return repo.save(item);
  }
}
