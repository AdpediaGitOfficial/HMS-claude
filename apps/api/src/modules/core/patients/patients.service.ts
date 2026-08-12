import { Injectable } from "@nestjs/common";
import { Patient } from "../entities/patient.entity";
import { CreatePatientDto } from "../dto/create-patient.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

/**
 * Reference implementation for every future tenant-scoped service: reads
 * go through tenantManager() (the RLS-scoped connection TenantInterceptor
 * set up for this request), never through an @InjectRepository default
 * pool connection — that pool has no `app.tenant_id` set and RLS would
 * simply return nothing.
 */
@Injectable()
export class PatientsService {
  async list(): Promise<Patient[]> {
    return tenantManager().getRepository(Patient).find({ order: { createdAt: "DESC" } });
  }

  async create(dto: CreatePatientDto): Promise<Patient> {
    const repo = tenantManager().getRepository(Patient);
    const mrn = await this.nextMrn();
    const patient = repo.create({
      ...dto,
      mrn,
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(patient);
  }

  private async nextMrn(): Promise<string> {
    const count = await tenantManager().getRepository(Patient).count();
    const year = new Date().getFullYear();
    return `HMS-${year}-${String(count + 1).padStart(5, "0")}`;
  }
}
