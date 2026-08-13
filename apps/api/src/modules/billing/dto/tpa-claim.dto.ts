import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { TpaClaimStatus } from "../entities/tpa-claim.entity";

export class SubmitTpaClaimDto {
  @IsUUID()
  invoiceId!: string;

  @IsUUID()
  patientId!: string;

  @IsString()
  insurerName!: string;

  @IsString()
  policyNumber!: string;

  @IsNumber()
  @Min(0.01)
  claimedAmount!: number;
}

export class UpdateTpaClaimStatusDto {
  @IsIn(["approved", "rejected", "settled"])
  status!: TpaClaimStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;
}
