import { Injectable } from "@nestjs/common";
import { AuditLog } from "../core/entities/audit-log.entity";
import { tenantManager } from "../../common/tenant/tenant-context";

@Injectable()
export class AuditService {
  async recent(limit = 100): Promise<AuditLog[]> {
    return tenantManager().getRepository(AuditLog).find({ order: { createdAt: "DESC" }, take: limit });
  }
}
