import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Invoice } from "./entities/invoice.entity";
import { InvoiceLine } from "./entities/invoice-line.entity";
import { Payment } from "./entities/payment.entity";
import { TpaClaim } from "./entities/tpa-claim.entity";
import { InvoicesController } from "./invoices/invoices.controller";
import { InvoicesService } from "./invoices/invoices.service";
import { PaymentsController } from "./payments/payments.controller";
import { PaymentsService } from "./payments/payments.service";
import { TpaClaimsController } from "./tpa-claims/tpa-claims.controller";
import { TpaClaimsService } from "./tpa-claims/tpa-claims.service";

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceLine, Payment, TpaClaim])],
  controllers: [InvoicesController, PaymentsController, TpaClaimsController],
  providers: [InvoicesService, PaymentsService, TpaClaimsService],
  exports: [TypeOrmModule],
})
export class BillingModule {}
