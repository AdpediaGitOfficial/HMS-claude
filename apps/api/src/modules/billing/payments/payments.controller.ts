import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { PaymentsService } from "./payments.service";
import { RecordPaymentDto } from "../dto/record-payment.dto";

@Controller("billing/invoices/:invoiceId/payments")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @Permissions("billing.payments.read")
  listForInvoice(@Param("invoiceId") invoiceId: string) {
    return this.payments.listForInvoice(invoiceId);
  }

  @Post()
  @Permissions("billing.payments.create")
  record(@Param("invoiceId") invoiceId: string, @Body() dto: RecordPaymentDto) {
    return this.payments.record(invoiceId, dto);
  }
}
