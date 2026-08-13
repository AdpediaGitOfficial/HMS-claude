import { Injectable } from "@nestjs/common";
import { BirthRecord } from "../entities/birth-record.entity";
import { DeathRecord } from "../entities/death-record.entity";
import { RegisterBirthDto, RegisterDeathDto } from "../dto/vital-records.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class VitalRecordsService {
  async listBirths(): Promise<BirthRecord[]> {
    return tenantManager().getRepository(BirthRecord).find({ order: { dateOfBirth: "DESC" } });
  }

  async listDeaths(): Promise<DeathRecord[]> {
    return tenantManager().getRepository(DeathRecord).find({ order: { dateOfDeath: "DESC" } });
  }

  async registerBirth(dto: RegisterBirthDto): Promise<BirthRecord> {
    const repo = tenantManager().getRepository(BirthRecord);
    const record = repo.create({
      ...dto,
      weightKg: dto.weightKg?.toFixed(2),
      attendingDoctorId: currentUserId(),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(record);
  }

  async registerDeath(dto: RegisterDeathDto): Promise<DeathRecord> {
    const repo = tenantManager().getRepository(DeathRecord);
    const record = repo.create({
      ...dto,
      certifyingDoctorId: currentUserId(),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(record);
  }
}
