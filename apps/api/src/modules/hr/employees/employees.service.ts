import { Injectable } from "@nestjs/common";
import { EmployeeDetail } from "../entities/employee-detail.entity";
import { CreateEmployeeDto } from "../dto/hr.dto";
import { currentTenantId, currentUserId, tenantManager } from "../../../common/tenant/tenant-context";

@Injectable()
export class EmployeesService {
  async list(): Promise<EmployeeDetail[]> {
    return tenantManager().getRepository(EmployeeDetail).find({ order: { createdAt: "DESC" } });
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeDetail> {
    const repo = tenantManager().getRepository(EmployeeDetail);
    const detail = repo.create({
      ...dto,
      monthlySalary: dto.monthlySalary.toFixed(2),
      tenantId: currentTenantId(),
      createdBy: currentUserId(),
      updatedBy: currentUserId(),
    });
    return repo.save(detail);
  }
}
