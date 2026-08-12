import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreatePatientDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
