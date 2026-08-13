import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class RegisterBirthDto {
  @IsOptional()
  @IsUUID()
  motherPatientId?: string;

  @IsOptional()
  @IsString()
  babyName?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;
}

export class RegisterDeathDto {
  @IsUUID()
  patientId!: string;

  @IsDateString()
  dateOfDeath!: string;

  @IsString()
  causeOfDeath!: string;
}
