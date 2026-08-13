import { Injectable } from "@nestjs/common";
import { StockItem } from "../entities/stock-item.entity";
import { CreateStockItemDto } from "../dto/create-stock-item.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class StockService {
  async list(): Promise<StockItem[]> {
    return tenantManager().getRepository(StockItem).find({ order: { name: "ASC" } });
  }

  /** Powers the "low stock" alert widget — items at or below their reorder level. */
  async listLow(): Promise<StockItem[]> {
    const items = await this.list();
    return items.filter((i) => i.quantityOnHand <= i.reorderLevel);
  }

  async create(dto: CreateStockItemDto): Promise<StockItem> {
    const repo = tenantManager().getRepository(StockItem);
    const item = repo.create({
      ...dto,
      quantityOnHand: dto.quantityOnHand ?? 0,
      reorderLevel: dto.reorderLevel ?? 0,
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(item);
  }
}
