import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AdmissionsService } from "./admissions.service";
import { AdmitPatientDto, DischargePatientDto } from "../dto/admit-patient.dto";

@Controller("admissions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdmissionsController {
  constructor(private readonly admissions: AdmissionsService) {}

  @Get()
  @Permissions("clinical.ipd.read")
  list() {
    return this.admissions.list();
  }

  @Post()
  @Permissions("clinical.ipd.admit")
  admit(@Body() dto: AdmitPatientDto) {
    return this.admissions.admit(dto);
  }

  @Post(":id/discharge")
  @Permissions("clinical.ipd.discharge")
  discharge(@Param("id") id: string, @Body() dto: DischargePatientDto) {
    return this.admissions.discharge(id, dto);
  }
}
