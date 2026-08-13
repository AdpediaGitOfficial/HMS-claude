import { Injectable } from "@nestjs/common";
import { Attendance } from "../entities/attendance.entity";
import { MarkAttendanceDto } from "../dto/hr.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class AttendanceService {
  async listForDate(date?: string): Promise<Attendance[]> {
    return tenantManager().getRepository(Attendance).find({ where: { date: date ?? todayIso() } });
  }

  /** Upserts today's (or a given date's) attendance for one employee — marking twice just corrects the entry. */
  async mark(dto: MarkAttendanceDto): Promise<Attendance> {
    const date = dto.date ?? todayIso();
    const repo = tenantManager().getRepository(Attendance);
    let entry = await repo.findOne({ where: { userId: dto.userId, date } });
    if (entry) {
      entry.status = dto.status;
      entry.markedBy = currentUserId();
      entry.updatedBy = currentUserId();
      return repo.save(entry);
    }
    entry = repo.create({
      userId: dto.userId,
      date,
      status: dto.status,
      markedBy: currentUserId(),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(entry);
  }
}
