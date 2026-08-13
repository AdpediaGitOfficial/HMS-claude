import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class AddInvoiceLineDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsUUID()
  orderId?: string;
}
