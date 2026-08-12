import { IsOptional, IsString, IsUUID } from "class-validator";

export class AdmitPatientDto {
  @IsUUID()
  patientId!: string;

  @IsUUID()
  bedId!: string;

  @IsOptional()
  @IsString()
  department?: string;
}

export class DischargePatientDto {
  @IsOptional()
  @IsString()
  dischargeSummary?: string;
}
