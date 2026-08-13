import { BadRequestException, Injectable } from "@nestjs/common";
import { Invoice } from "../entities/invoice.entity";
import { InvoiceLine } from "../entities/invoice-line.entity";
import { Payment } from "../entities/payment.entity";
import { CreateInvoiceDto } from "../dto/create-invoice.dto";
import { AddInvoiceLineDto } from "../dto/add-invoice-line.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class InvoicesService {
  async list(): Promise<Invoice[]> {
    return tenantManager().getRepository(Invoice).find({ order: { createdAt: "DESC" } });
  }

  async findOne(id: string): Promise<Invoice> {
    return tenantManager().getRepository(Invoice).findOneOrFail({ where: { id } });
  }

  async listLines(invoiceId: string): Promise<InvoiceLine[]> {
    return tenantManager().getRepository(InvoiceLine).find({ where: { invoiceId }, order: { createdAt: "ASC" } });
  }

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const repo = tenantManager().getRepository(Invoice);
    const invoice = repo.create({
      ...dto,
      status: "draft",
      totalAmount: "0",
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(invoice);
  }

  async addLine(invoiceId: string, dto: AddInvoiceLineDto): Promise<InvoiceLine> {
    const invoice = await this.findOne(invoiceId);
    if (invoice.status !== "draft") {
      throw new BadRequestException("Only a draft invoice can have lines added");
    }

    const quantity = dto.quantity ?? 1;
    const amount = quantity * dto.unitPrice;

    const lineRepo = tenantManager().getRepository(InvoiceLine);
    const line = lineRepo.create({
      invoiceId,
      orderId: dto.orderId,
      description: dto.description,
      quantity,
      unitPrice: dto.unitPrice.toFixed(2),
      amount: amount.toFixed(2),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    const saved = await lineRepo.save(line);

    await this.recalculateTotal(invoiceId);
    return saved;
  }

  async issue(invoiceId: string): Promise<Invoice> {
    const repo = tenantManager().getRepository(Invoice);
    const invoice = await repo.findOneOrFail({ where: { id: invoiceId } });
    if (invoice.status !== "draft") {
      throw new BadRequestException("Invoice already issued");
    }
    if (Number(invoice.totalAmount) <= 0) {
      throw new BadRequestException("Cannot issue an invoice with no line items");
    }
    invoice.status = "issued";
    invoice.issuedAt = new Date();
    invoice.updatedBy = currentUserId();
    return repo.save(invoice);
  }

  /** Recomputes total from lines, and — separately — status from payments (§ used after both addLine and recordPayment). */
  async recalculateTotal(invoiceId: string): Promise<void> {
    const lines = await this.listLines(invoiceId);
    const total = lines.reduce((sum, l) => sum + Number(l.amount), 0);
    await tenantManager().getRepository(Invoice).update({ id: invoiceId }, { totalAmount: total.toFixed(2) });
  }

  async recalculateStatusFromPayments(invoiceId: string): Promise<Invoice> {
    const invoice = await this.findOne(invoiceId);
    const payments = await tenantManager().getRepository(Payment).find({ where: { invoiceId } });
    const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const total = Number(invoice.totalAmount);

    const repo = tenantManager().getRepository(Invoice);
    if (paid >= total && total > 0) {
      invoice.status = "paid";
    } else if (paid > 0) {
      invoice.status = "partially_paid";
    }
    invoice.updatedBy = currentUserId();
    return repo.save(invoice);
  }
}
