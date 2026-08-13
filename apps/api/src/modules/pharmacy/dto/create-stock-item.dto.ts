import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateStockItemDto {
  @IsString()
  name!: string;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantityOnHand?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reorderLevel?: number;
}
