import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";

@Controller("appointments")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Get()
  @Permissions("clinical.appointments.read")
  list() {
    return this.appointments.list();
  }

  @Post()
  @Permissions("clinical.appointments.create")
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointments.create(dto);
  }

  @Post(":id/check-in")
  @Permissions("clinical.appointments.update")
  checkIn(@Param("id") id: string) {
    return this.appointments.checkIn(id);
  }
}
