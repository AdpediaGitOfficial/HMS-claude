import { IsIn, IsOptional, IsString, IsUUID } from "class-validator";
import { ReferralStatus } from "../entities/referral.entity";

export class CreateReferralDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsString()
  externalDoctorName?: string;

  @IsOptional()
  @IsString()
  externalClinicName?: string;

  @IsString()
  reason!: string;
}

export class UpdateReferralStatusDto {
  @IsIn(["accepted", "completed"])
  status!: ReferralStatus;
}
