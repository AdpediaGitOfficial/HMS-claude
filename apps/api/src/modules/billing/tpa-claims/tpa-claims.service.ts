import { BadRequestException, Injectable } from "@nestjs/common";
import { TpaClaim } from "../entities/tpa-claim.entity";
import { SubmitTpaClaimDto, UpdateTpaClaimStatusDto } from "../dto/tpa-claim.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class TpaClaimsService {
  async list(): Promise<TpaClaim[]> {
    return tenantManager().getRepository(TpaClaim).find({ order: { submittedAt: "DESC" } });
  }

  async submit(dto: SubmitTpaClaimDto): Promise<TpaClaim> {
    const repo = tenantManager().getRepository(TpaClaim);
    const claim = repo.create({
      ...dto,
      claimedAmount: dto.claimedAmount.toFixed(2),
      status: "submitted",
      submittedAt: new Date(),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(claim);
  }

  async updateStatus(id: string, dto: UpdateTpaClaimStatusDto): Promise<TpaClaim> {
    const repo = tenantManager().getRepository(TpaClaim);
    const claim = await repo.findOneOrFail({ where: { id } });
    if (claim.status === "settled") {
      throw new BadRequestException("Claim is already settled");
    }

    claim.status = dto.status;
    if (dto.approvedAmount !== undefined) claim.approvedAmount = dto.approvedAmount.toFixed(2);
    if (dto.status === "rejected" || dto.status === "settled") claim.resolvedAt = new Date();
    claim.updatedBy = currentUserId();
    return repo.save(claim);
  }
}
