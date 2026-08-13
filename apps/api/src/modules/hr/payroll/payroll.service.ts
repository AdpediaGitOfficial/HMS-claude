import { BadRequestException, Injectable } from "@nestjs/common";
import { PayrollRun } from "../entities/payroll-run.entity";
import { Payslip } from "../entities/payslip.entity";
import { EmployeeDetail } from "../entities/employee-detail.entity";
import { CreatePayrollRunDto } from "../dto/hr.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class PayrollService {
  async listRuns(): Promise<PayrollRun[]> {
    return tenantManager().getRepository(PayrollRun).find({ order: { periodYear: "DESC", periodMonth: "DESC" } });
  }

  async listPayslips(runId: string): Promise<Payslip[]> {
    return tenantManager().getRepository(Payslip).find({ where: { payrollRunId: runId } });
  }

  async createRun(dto: CreatePayrollRunDto): Promise<PayrollRun> {
    const repo = tenantManager().getRepository(PayrollRun);
    const run = repo.create({
      ...dto,
      status: "draft",
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(run);
  }

  /** Generates one payslip per employee from their current monthly salary — a flat run, no proration/tax logic yet. */
  async processRun(runId: string): Promise<PayrollRun> {
    const runRepo = tenantManager().getRepository(PayrollRun);
    const run = await runRepo.findOneOrFail({ where: { id: runId } });
    if (run.status === "processed") {
      throw new BadRequestException("Payroll run already processed");
    }

    const employees = await tenantManager().getRepository(EmployeeDetail).find();
    const payslipRepo = tenantManager().getRepository(Payslip);
    for (const emp of employees) {
      const gross = Number(emp.monthlySalary);
      await payslipRepo.save(
        payslipRepo.create({
          payrollRunId: run.id,
          userId: emp.userId,
          grossAmount: gross.toFixed(2),
          deductions: "0.00",
          netAmount: gross.toFixed(2),
          tenantId: currentTenantId(),
          createdBy: currentUserId(),
          updatedBy: currentUserId(),
        }),
      );
    }

    run.status = "processed";
    run.processedAt = new Date();
    run.updatedBy = currentUserId();
    return runRepo.save(run);
  }
}
