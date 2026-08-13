import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto } from "../dto/create-invoice.dto";
import { AddInvoiceLineDto } from "../dto/add-invoice-line.dto";

@Controller("billing/invoices")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @Permissions("billing.invoices.read")
  list() {
    return this.invoices.list();
  }

  @Get(":id")
  @Permissions("billing.invoices.read")
  findOne(@Param("id") id: string) {
    return this.invoices.findOne(id);
  }

  @Get(":id/lines")
  @Permissions("billing.invoices.read")
  listLines(@Param("id") id: string) {
    return this.invoices.listLines(id);
  }

  @Post()
  @Permissions("billing.invoices.create")
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoices.create(dto);
  }

  @Post(":id/lines")
  @Permissions("billing.invoices.update")
  addLine(@Param("id") id: string, @Body() dto: AddInvoiceLineDto) {
    return this.invoices.addLine(id, dto);
  }

  @Post(":id/issue")
  @Permissions("billing.invoices.update")
  issue(@Param("id") id: string) {
    return this.invoices.issue(id);
  }
}
