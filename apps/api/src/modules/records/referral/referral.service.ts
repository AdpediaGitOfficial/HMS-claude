import { Injectable } from "@nestjs/common";
import { Referral } from "../entities/referral.entity";
import { CreateReferralDto, UpdateReferralStatusDto } from "../dto/referral.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class ReferralService {
  async list(): Promise<Referral[]> {
    return tenantManager().getRepository(Referral).find({ order: { referredAt: "DESC" } });
  }

  async create(dto: CreateReferralDto): Promise<Referral> {
    const repo = tenantManager().getRepository(Referral);
    const referral = repo.create({
      ...dto,
      referringDoctorId: currentUserId(),
      status: "pending",
      referredAt: new Date(),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(referral);
  }

  async updateStatus(id: string, dto: UpdateReferralStatusDto): Promise<Referral> {
    const repo = tenantManager().getRepository(Referral);
    const referral = await repo.findOneOrFail({ where: { id } });
    referral.status = dto.status;
    referral.updatedBy = currentUserId();
    return repo.save(referral);
  }
}
