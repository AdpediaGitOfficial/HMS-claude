import { Injectable } from "@nestjs/common";
import { Order, OrderStatus, OrderType } from "../entities/order.entity";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class OrdersService {
  async listForEncounter(encounterId: string): Promise<Order[]> {
    return tenantManager()
      .getRepository(Order)
      .find({ where: { encounterId }, order: { orderedAt: "DESC" } });
  }

  /** Pending orders of a given type — powers the Pharmacy dispense queue and the Lab worklist. */
  async listPending(orderType: OrderType): Promise<Order[]> {
    return tenantManager()
      .getRepository(Order)
      .find({ where: { orderType, status: "pending" }, order: { orderedAt: "ASC" } });
  }

  async create(params: { encounterId: string; orderType: OrderType; notes?: string }): Promise<Order> {
    const repo = tenantManager().getRepository(Order);
    const order = repo.create({
      ...params,
      tenantId: currentTenantId(),
      status: "pending",
      orderedBy: currentUserId(),
      orderedAt: new Date(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(order);
  }

  async setStatus(id: string, status: OrderStatus): Promise<Order> {
    const repo = tenantManager().getRepository(Order);
    const order = await repo.findOneOrFail({ where: { id } });
    order.status = status;
    order.updatedBy = currentUserId();
    return repo.save(order);
  }
}
