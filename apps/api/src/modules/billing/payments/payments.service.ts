import { BadRequestException, Injectable } from "@nestjs/common";
import { Payment } from "../entities/payment.entity";
import { RecordPaymentDto } from "../dto/record-payment.dto";
import { InvoicesService } from "../invoices/invoices.service";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class PaymentsService {
  constructor(private readonly invoices: InvoicesService) {}

  async listForInvoice(invoiceId: string): Promise<Payment[]> {
    return tenantManager().getRepository(Payment).find({ where: { invoiceId }, order: { paidAt: "ASC" } });
  }

  async record(invoiceId: string, dto: RecordPaymentDto): Promise<Payment> {
    const invoice = await this.invoices.findOne(invoiceId);
    if (invoice.status === "draft") {
      throw new BadRequestException("Issue the invoice before recording a payment");
    }
    if (invoice.status === "paid" || invoice.status === "cancelled") {
      throw new BadRequestException(`Invoice is already ${invoice.status}`);
    }

    const repo = tenantManager().getRepository(Payment);
    const payment = repo.create({
      invoiceId,
      amount: dto.amount.toFixed(2),
      method: dto.method,
      recordedBy: currentUserId(),
      paidAt: new Date(),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    const saved = await repo.save(payment);

    await this.invoices.recalculateStatusFromPayments(invoiceId);

    return saved;
  }
}
