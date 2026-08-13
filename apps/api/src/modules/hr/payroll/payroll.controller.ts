import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { PayrollService } from "./payroll.service";
import { CreatePayrollRunDto } from "../dto/hr.dto";

@Controller("hr/payroll")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  @Get("runs")
  @Permissions("hr.payroll.read")
  listRuns() {
    return this.payroll.listRuns();
  }

  @Get("runs/:id/payslips")
  @Permissions("hr.payroll.read")
  listPayslips(@Param("id") id: string) {
    return this.payroll.listPayslips(id);
  }

  @Post("runs")
  @Permissions("hr.payroll.create")
  createRun(@Body() dto: CreatePayrollRunDto) {
    return this.payroll.createRun(dto);
  }

  @Post("runs/:id/process")
  @Permissions("hr.payroll.process")
  processRun(@Param("id") id: string) {
    return this.payroll.processRun(id);
  }
}
