import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "../dto/hr.dto";

@Controller("hr/employees")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Get()
  @Permissions("hr.employees.read")
  list() {
    return this.employees.list();
  }

  @Post()
  @Permissions("hr.employees.create")
  create(@Body() dto: CreateEmployeeDto) {
    return this.employees.create(dto);
  }
}
