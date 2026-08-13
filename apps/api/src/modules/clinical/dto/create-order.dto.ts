import { IsIn, IsOptional, IsString, IsUUID } from "class-validator";
import { OrderType } from "../entities/order.entity";

export class CreateOrderDto {
  @IsUUID()
  encounterId!: string;

  @IsIn(["pharmacy", "lab", "radiology"])
  orderType!: OrderType;

  @IsOptional()
  @IsString()
  notes?: string;
}
