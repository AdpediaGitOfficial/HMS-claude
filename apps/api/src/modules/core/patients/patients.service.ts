import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Patient } from "../entities/patient.entity";
import { TpaProvider } from "../../billing/entities/tpa-provider.entity";
import { CreatePatientDto } from "../dto/create-patient.dto";
import { UpdatePatientDto } from "../dto/update-patient.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

const MAX_PLAUSIBLE_AGE_YEARS = 130;

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

  async get(id: string): Promise<Patient> {
    const patient = await tenantManager().getRepository(Patient).findOne({ where: { id } });
    if (!patient) throw new NotFoundException("Patient not found");
    return patient;
  }

  async create(dto: CreatePatientDto): Promise<Patient> {
    await this.validateClinicalFields(dto);
    await this.validateTpaFields(dto);

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

  /**
   * Validates against the *merged* state (existing row + patch), not the
   * patch alone — otherwise `PATCH { tpaId: "..." }` on a patient who
   * already has a tpaProviderId from registration would be rejected for
   * "missing" a provider that's actually already set, just not present in
   * this particular request body.
   *
   * `dto` is a class instance, so every field declared on UpdatePatientDto
   * exists as an own property set to `undefined` even when the client
   * never sent it (TS class-fields semantics) — spreading/assigning it
   * as-is would clobber every untouched column back to undefined. Only
   * keys the client actually sent (undefined filtered out; explicit null
   * kept, e.g. to clear tpaProviderId) get merged in.
   */
  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    const repo = tenantManager().getRepository(Patient);
    const patient = await repo.findOne({ where: { id } });
    if (!patient) throw new NotFoundException("Patient not found");

    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));

    const merged = { ...patient, ...patch };
    await this.validateClinicalFields(merged);
    await this.validateTpaFields(merged);

    Object.assign(patient, patch);
    patient.updatedBy = currentUserId();
    return repo.save(patient);
  }

  private async validateClinicalFields(dto: { dateOfBirth?: string }): Promise<void> {
    if (!dto.dateOfBirth) return;
    const dob = new Date(dto.dateOfBirth);
    const now = new Date();
    if (dob > now) {
      throw new BadRequestException("Date of birth cannot be in the future.");
    }
    const oldestPlausible = new Date(now);
    oldestPlausible.setFullYear(now.getFullYear() - MAX_PLAUSIBLE_AGE_YEARS);
    if (dob < oldestPlausible) {
      throw new BadRequestException(`Date of birth implies an age over ${MAX_PLAUSIBLE_AGE_YEARS} years — check the value.`);
    }
  }

  /**
   * TPA ID / validity only make sense attached to a provider — reject a
   * patch that would leave one dangling with no provider selected, rather
   * than silently discarding it. tpaProviderId itself must resolve inside
   * this tenant; RLS already keeps a cross-tenant id from matching, this
   * just turns "not found" into a clean 400 instead of an FK-violation 500.
   */
  private async validateTpaFields(dto: {
    tpaProviderId?: string | null;
    tpaId?: string | null;
    tpaValidity?: string | null;
  }): Promise<void> {
    if (!dto.tpaProviderId) {
      if (dto.tpaId || dto.tpaValidity) {
        throw new BadRequestException("Select a TPA provider before adding a TPA ID or validity date.");
      }
      return;
    }

    const provider = await tenantManager().getRepository(TpaProvider).findOne({ where: { id: dto.tpaProviderId } });
    if (!provider) {
      throw new BadRequestException("Selected TPA provider was not found.");
    }
  }

  private async nextMrn(): Promise<string> {
    const count = await tenantManager().getRepository(Patient).count();
    const year = new Date().getFullYear();
    return `HMS-${year}-${String(count + 1).padStart(5, "0")}`;
  }
}
