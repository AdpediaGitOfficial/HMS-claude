import { BadRequestException, Injectable } from "@nestjs/common";
import { BloodUnit } from "../entities/blood-unit.entity";
import { AddBloodUnitDto, IssueBloodUnitDto } from "../dto/blood-bank.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

const DEFAULT_SHELF_LIFE_DAYS = 42; // whole blood, standard storage

@Injectable()
export class BloodBankService {
  async list(): Promise<BloodUnit[]> {
    return tenantManager().getRepository(BloodUnit).find({ order: { bloodType: "ASC" } });
  }

  /** Powers the inventory grid (§10 dashboard mockup pattern) — available-unit counts grouped by type. */
  async summary(): Promise<Record<string, number>> {
    const units = await tenantManager().getRepository(BloodUnit).find({ where: { status: "available" } });
    const counts: Record<string, number> = {};
    for (const u of units) counts[u.bloodType] = (counts[u.bloodType] ?? 0) + 1;
    return counts;
  }

  async addUnit(dto: AddBloodUnitDto): Promise<BloodUnit> {
    const repo = tenantManager().getRepository(BloodUnit);
    const collectedAt = new Date();
    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : new Date(collectedAt.getTime() + DEFAULT_SHELF_LIFE_DAYS * 24 * 60 * 60 * 1000);

    const unit = repo.create({
      bloodType: dto.bloodType,
      status: "available",
      collectedAt,
      expiresAt,
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(unit);
  }

  async issue(id: string, dto: IssueBloodUnitDto): Promise<BloodUnit> {
    const repo = tenantManager().getRepository(BloodUnit);
    const unit = await repo.findOneOrFail({ where: { id } });
    if (unit.status !== "available") {
      throw new BadRequestException(`Unit is not available (${unit.status})`);
    }
    unit.status = "issued";
    unit.issuedToPatientId = dto.patientId;
    unit.issuedAt = new Date();
    unit.updatedBy = currentUserId();
    return repo.save(unit);
  }
}
