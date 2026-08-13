import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AttendanceService } from "./attendance.service";
import { MarkAttendanceDto } from "../dto/hr.dto";

@Controller("hr/attendance")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get()
  @Permissions("hr.attendance.read")
  listForDate(@Query("date") date?: string) {
    return this.attendance.listForDate(date);
  }

  @Post()
  @Permissions("hr.attendance.mark")
  mark(@Body() dto: MarkAttendanceDto) {
    return this.attendance.mark(dto);
  }
}
