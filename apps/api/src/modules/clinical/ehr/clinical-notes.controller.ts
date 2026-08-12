import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { ClinicalNotesService } from "./clinical-notes.service";
import { CreateClinicalNoteDto } from "../dto/create-clinical-note.dto";

@Controller("clinical-notes")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClinicalNotesController {
  constructor(private readonly notes: ClinicalNotesService) {}

  @Get("by-encounter/:encounterId")
  @Permissions("clinical.ehr.read")
  listForEncounter(@Param("encounterId") encounterId: string) {
    return this.notes.listForEncounter(encounterId);
  }

  @Post()
  @Permissions("clinical.ehr.create")
  create(@Body() dto: CreateClinicalNoteDto) {
    return this.notes.create(dto);
  }
}
