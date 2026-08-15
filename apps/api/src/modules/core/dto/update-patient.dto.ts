import { IsDateString, IsEmail, IsOptional, IsString, IsUUID } from "class-validator";

/** Every field optional — a PATCH only sends what changed. TPA consistency (tpaId/tpaValidity require a tpaProviderId) is validated in PatientsService against the merged (existing + patch) state, not the patch alone. */
export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsUUID()
  tpaProviderId?: string | null;

  @IsOptional()
  @IsString()
  tpaId?: string | null;

  @IsOptional()
  @IsDateString()
  tpaValidity?: string | null;

  @IsOptional()
  @IsString()
  alternatePhone?: string;
}
