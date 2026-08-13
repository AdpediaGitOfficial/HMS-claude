import { IsIn, IsNumber, Min } from "class-validator";
import { PaymentMethod } from "../entities/payment.entity";

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsIn(["cash", "card", "upi", "insurance"])
  method!: PaymentMethod;
}
