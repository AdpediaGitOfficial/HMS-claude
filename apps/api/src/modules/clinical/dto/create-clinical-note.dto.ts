import { IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateClinicalNoteDto {
  @IsUUID()
  encounterId!: string;

  @IsOptional()
  @IsObject()
  vitals?: Record<string, string | number>;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  prescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
