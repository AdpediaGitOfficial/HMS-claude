import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { PatientsService } from "./patients.service";
import { CreatePatientDto } from "../dto/create-patient.dto";

@Controller("patients")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  @Permissions("core.patients.read")
  list() {
    return this.patients.list();
  }

  @Post()
  @Permissions("core.patients.create")
  create(@Body() dto: CreatePatientDto) {
    return this.patients.create(dto);
  }
}
