import { Injectable } from "@nestjs/common";
import { Encounter, EncounterStatus, EncounterType } from "../entities/encounter.entity";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

/**
 * Opens/closes the Visit spine entity (§11). Other clinical services
 * (Appointments check-in, IPD admit) call openEncounter() rather than
 * inserting into clinical.encounters directly, so "what counts as a visit"
 * stays defined in one place.
 */
@Injectable()
export class EncountersService {
  async listForPatient(patientId: string): Promise<Encounter[]> {
    return tenantManager()
      .getRepository(Encounter)
      .find({ where: { patientId }, order: { startedAt: "DESC" } });
  }

  /** Powers OPD's "today's queue" and EHR's landing list — filterable by type/status rather than one endpoint per view. */
  async list(filter: { type?: EncounterType; status?: EncounterStatus } = {}): Promise<Encounter[]> {
    return tenantManager()
      .getRepository(Encounter)
      .find({ where: filter, order: { startedAt: "DESC" } });
  }

  async findOne(id: string): Promise<Encounter | null> {
    return tenantManager().getRepository(Encounter).findOne({ where: { id } });
  }

  async openEncounter(params: {
    patientId: string;
    type: EncounterType;
    providerId?: string;
    branchId?: string;
    appointmentId?: string;
    department?: string;
  }): Promise<Encounter> {
    const repo = tenantManager().getRepository(Encounter);
    const encounter = repo.create({
      ...params,
      tenantId: currentTenantId(),
      status: "in_progress",
      startedAt: new Date(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(encounter);
  }

  async closeEncounter(id: string): Promise<Encounter> {
    const repo = tenantManager().getRepository(Encounter);
    const encounter = await repo.findOneOrFail({ where: { id } });
    encounter.status = "completed";
    encounter.endedAt = new Date();
    encounter.updatedBy = currentUserId();
    return repo.save(encounter);
  }
}
