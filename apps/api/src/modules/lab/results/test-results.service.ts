import { Injectable } from "@nestjs/common";
import { TestResult } from "../entities/test-result.entity";
import { TestCatalog } from "../entities/test-catalog.entity";
import { OrderTestDto, EnterResultDto } from "../dto/order-test.dto";
import { OrdersService } from "../../clinical/orders/orders.service";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class TestResultsService {
  constructor(private readonly orders: OrdersService) {}

  /** Creates the Order (§11 spine) and the pending TestResult that fulfils it, in one step. */
  async orderTest(dto: OrderTestDto): Promise<TestResult> {
    const catalog = await tenantManager().getRepository(TestCatalog).findOneOrFail({ where: { id: dto.testCatalogId } });

    const order = await this.orders.create({
      encounterId: dto.encounterId,
      orderType: catalog.category, // "lab" | "radiology"
    });

    const repo = tenantManager().getRepository(TestResult);
    const result = repo.create({
      orderId: order.id,
      testCatalogId: dto.testCatalogId,
      resultStatus: "pending",
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(result);
  }

  /** The worklist — every result still waiting to be reported, across lab and radiology. */
  async listPending(): Promise<TestResult[]> {
    return tenantManager().getRepository(TestResult).find({ where: { resultStatus: "pending" }, order: { createdAt: "ASC" } });
  }

  async enterResult(id: string, dto: EnterResultDto): Promise<TestResult> {
    const repo = tenantManager().getRepository(TestResult);
    const result = await repo.findOneOrFail({ where: { id } });
    result.resultValue = dto.resultValue;
    result.resultStatus = "completed";
    result.reportedBy = currentUserId();
    result.reportedAt = new Date();
    result.updatedBy = currentUserId();
    const saved = await repo.save(result);

    await this.orders.setStatus(result.orderId, "completed");

    return saved;
  }
}
