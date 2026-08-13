import { BadRequestException, Injectable } from "@nestjs/common";
import { StockItem } from "../entities/stock-item.entity";
import { DispenseRecord } from "../entities/dispense-record.entity";
import { DispenseDto } from "../dto/dispense.dto";
import { OrdersService } from "../../clinical/orders/orders.service";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class DispenseService {
  constructor(private readonly orders: OrdersService) {}

  async listForOrder(orderId: string): Promise<DispenseRecord[]> {
    return tenantManager().getRepository(DispenseRecord).find({ where: { orderId } });
  }

  /** Decrements stock, records the dispense, and closes out the pharmacy Order — one unit of work, one RLS transaction. */
  async dispense(dto: DispenseDto): Promise<DispenseRecord> {
    const stockRepo = tenantManager().getRepository(StockItem);
    const item = await stockRepo.findOneOrFail({ where: { id: dto.stockItemId } });
    if (item.quantityOnHand < dto.quantity) {
      throw new BadRequestException(`Insufficient stock for ${item.name}: ${item.quantityOnHand} on hand`);
    }

    item.quantityOnHand -= dto.quantity;
    item.updatedBy = currentUserId();
    await stockRepo.save(item);

    const recordRepo = tenantManager().getRepository(DispenseRecord);
    const record = recordRepo.create({
      orderId: dto.orderId,
      stockItemId: dto.stockItemId,
      quantity: dto.quantity,
      dispensedBy: currentUserId(),
      dispensedAt: new Date(),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    const saved = await recordRepo.save(record);

    await this.orders.setStatus(dto.orderId, "completed");

    return saved;
  }
}
