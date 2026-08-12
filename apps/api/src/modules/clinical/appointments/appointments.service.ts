import { Injectable } from "@nestjs/common";
import { Appointment } from "../entities/appointment.entity";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
import { EncountersService } from "../encounters/encounters.service";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class AppointmentsService {
  constructor(private readonly encounters: EncountersService) {}

  async list(): Promise<Appointment[]> {
    return tenantManager().getRepository(Appointment).find({ order: { scheduledAt: "ASC" } });
  }

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const repo = tenantManager().getRepository(Appointment);
    const appointment = repo.create({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
      tenantId: currentTenantId(),
      status: "booked",
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(appointment);
  }

  /** Turns a booked appointment into an OPD Encounter — the moment a scheduled visit becomes a real one. */
  async checkIn(id: string) {
    const repo = tenantManager().getRepository(Appointment);
    const appointment = await repo.findOneOrFail({ where: { id } });

    const encounter = await this.encounters.openEncounter({
      patientId: appointment.patientId,
      type: "opd",
      providerId: appointment.doctorId,
      branchId: appointment.branchId ?? undefined,
      appointmentId: appointment.id,
      department: appointment.department,
    });

    appointment.status = "checked_in";
    appointment.updatedBy = currentUserId();
    await repo.save(appointment);

    return encounter;
  }
}
