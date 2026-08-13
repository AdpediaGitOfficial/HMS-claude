import { IsDateString, IsIn, IsOptional, IsUUID } from "class-validator";
import { BloodType } from "../entities/blood-unit.entity";

const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export class AddBloodUnitDto {
  @IsIn(BLOOD_TYPES)
  bloodType!: BloodType;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class IssueBloodUnitDto {
  @IsUUID()
  patientId!: string;
}
