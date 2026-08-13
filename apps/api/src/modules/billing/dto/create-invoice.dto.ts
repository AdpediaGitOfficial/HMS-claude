import { IsUUID } from "class-validator";

export class CreateInvoiceDto {
  @IsUUID()
  encounterId!: string;

  @IsUUID()
  patientId!: string;
}
