import { BadRequestException, Injectable } from "@nestjs/common";
import { Admission } from "../entities/admission.entity";
import { Bed } from "../entities/bed.entity";
import { AdmitPatientDto, DischargePatientDto } from "../dto/admit-patient.dto";
import { EncountersService } from "../encounters/encounters.service";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class AdmissionsService {
  constructor(private readonly encounters: EncountersService) {}

  async list(): Promise<Admission[]> {
    return tenantManager().getRepository(Admission).find({ order: { admittedAt: "DESC" } });
  }

  /**
   * Opens an IPD Encounter, creates the Admission, and flips the bed to
   * occupied — all three or none, since this runs inside the request's
   * single RLS transaction (TenantInterceptor). The DB's partial unique
   * index on (bed_id WHERE status='admitted') is the final backstop if
   * two admit calls for the same bed ever race.
   */
  async admit(dto: AdmitPatientDto): Promise<Admission> {
    const bedRepo = tenantManager().getRepository(Bed);
    const bed = await bedRepo.findOneOrFail({ where: { id: dto.bedId } });
    if (bed.status !== "available") {
      throw new BadRequestException(`Bed ${bed.label} is not available (${bed.status})`);
    }

    const encounter = await this.encounters.openEncounter({
      patientId: dto.patientId,
      type: "ipd",
      department: dto.department,
    });

    const admissionRepo = tenantManager().getRepository(Admission);
    const admission = admissionRepo.create({
      patientId: dto.patientId,
      encounterId: encounter.id,
      bedId: dto.bedId,
      admittedAt: new Date(),
      status: "admitted",
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    const saved = await admissionRepo.save(admission);

    bed.status = "occupied";
    bed.updatedBy = currentUserId();
    await bedRepo.save(bed);

    return saved;
  }

  async discharge(admissionId: string, dto: DischargePatientDto): Promise<Admission> {
    const admissionRepo = tenantManager().getRepository(Admission);
    const admission = await admissionRepo.findOneOrFail({ where: { id: admissionId } });
    if (admission.status === "discharged") {
      throw new BadRequestException("Already discharged");
    }

    admission.status = "discharged";
    admission.dischargedAt = new Date();
    admission.dischargeSummary = dto.dischargeSummary;
    admission.updatedBy = currentUserId();
    const saved = await admissionRepo.save(admission);

    await this.encounters.closeEncounter(admission.encounterId);

    const bedRepo = tenantManager().getRepository(Bed);
    const bed = await bedRepo.findOneOrFail({ where: { id: admission.bedId } });
    bed.status = "available";
    bed.updatedBy = currentUserId();
    await bedRepo.save(bed);

    return saved;
  }
}
