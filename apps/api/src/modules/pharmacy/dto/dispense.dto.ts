import { IsInt, IsUUID, Min } from "class-validator";

export class DispenseDto {
  @IsUUID()
  orderId!: string;

  @IsUUID()
  stockItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
