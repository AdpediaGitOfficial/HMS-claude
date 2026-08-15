import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { PatientsService } from "./patients.service";
import { CreatePatientDto } from "../dto/create-patient.dto";
import { UpdatePatientDto } from "../dto/update-patient.dto";
import { patientPhotoMulterOptions } from "./patient-photo-upload.config";

@Controller("patients")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  @Permissions("core.patients.read")
  list() {
    return this.patients.list();
  }

  @Get(":id")
  @Permissions("core.patients.read")
  get(@Param("id") id: string) {
    return this.patients.get(id);
  }

  @Post()
  @Permissions("core.patients.create")
  create(@Body() dto: CreatePatientDto) {
    return this.patients.create(dto);
  }

  @Patch(":id")
  @Permissions("core.patients.update")
  update(@Param("id") id: string, @Body() dto: UpdatePatientDto) {
    return this.patients.update(id, dto);
  }

  /**
   * Uploads the photo first and hands back a URL, rather than accepting
   * multipart on the create/update routes directly — the preview in the
   * form can render immediately on file select, independent of Save, and
   * the create/update DTOs stay plain JSON like every other module's.
   */
  @Post("photo")
  @Permissions("core.patients.create")
  @UseInterceptors(FileInterceptor("file", patientPhotoMulterOptions))
  uploadPhoto(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file uploaded.");
    return { url: `/uploads/patients/${file.filename}` };
  }
}
