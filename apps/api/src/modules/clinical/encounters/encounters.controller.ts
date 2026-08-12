import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { EncountersService } from "./encounters.service";
import { EncounterStatus, EncounterType } from "../entities/encounter.entity";

@Controller("encounters")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EncountersController {
  constructor(private readonly encounters: EncountersService) {}

  @Get()
  @Permissions("clinical.encounters.read")
  list(@Query("type") type?: EncounterType, @Query("status") status?: EncounterStatus) {
    return this.encounters.list({ type, status });
  }

  @Get("by-patient/:patientId")
  @Permissions("clinical.encounters.read")
  listForPatient(@Param("patientId") patientId: string) {
    return this.encounters.listForPatient(patientId);
  }

  @Get(":id")
  @Permissions("clinical.encounters.read")
  findOne(@Param("id") id: string) {
    return this.encounters.findOne(id);
  }

  @Post(":id/close")
  @Permissions("clinical.encounters.update")
  close(@Param("id") id: string) {
    return this.encounters.closeEncounter(id);
  }
}
