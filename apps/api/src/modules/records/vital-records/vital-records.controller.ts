import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { VitalRecordsService } from "./vital-records.service";
import { RegisterBirthDto, RegisterDeathDto } from "../dto/vital-records.dto";

@Controller("vital-records")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VitalRecordsController {
  constructor(private readonly vitalRecords: VitalRecordsService) {}

  @Get("births")
  @Permissions("records.vital_records.read")
  listBirths() {
    return this.vitalRecords.listBirths();
  }

  @Get("deaths")
  @Permissions("records.vital_records.read")
  listDeaths() {
    return this.vitalRecords.listDeaths();
  }

  @Post("births")
  @Permissions("records.vital_records.create")
  registerBirth(@Body() dto: RegisterBirthDto) {
    return this.vitalRecords.registerBirth(dto);
  }

  @Post("deaths")
  @Permissions("records.vital_records.create")
  registerDeath(@Body() dto: RegisterDeathDto) {
    return this.vitalRecords.registerDeath(dto);
  }
}
