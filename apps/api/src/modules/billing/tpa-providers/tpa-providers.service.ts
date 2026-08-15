import { Injectable } from "@nestjs/common";
import { TpaProvider } from "../entities/tpa-provider.entity";
import { CreateTpaProviderDto } from "../dto/create-tpa-provider.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class TpaProvidersService {
  async list(): Promise<TpaProvider[]> {
    return tenantManager().getRepository(TpaProvider).find({ order: { name: "ASC" } });
  }

  /**
   * Idempotent by name (case-insensitive) rather than relying on the
   * unique index to reject a duplicate: the "+ Add new" quick-add in the
   * Add Patient form should hand back the existing provider if two people
   * add "Star Health" a minute apart, not a 500 from a constraint
   * violation.
   */
  async create(dto: CreateTpaProviderDto): Promise<TpaProvider> {
    const repo = tenantManager().getRepository(TpaProvider);
    const existing = await repo
      .createQueryBuilder("p")
      .where("lower(p.name) = lower(:name)", { name: dto.name.trim() })
      .getOne();
    if (existing) return existing;

    const provider = repo.create({
      ...dto,
      name: dto.name.trim(),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(provider);
  }
}
