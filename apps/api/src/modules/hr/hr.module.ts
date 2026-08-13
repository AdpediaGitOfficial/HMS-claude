import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeDetail } from "./entities/employee-detail.entity";
import { Attendance } from "./entities/attendance.entity";
import { PayrollRun } from "./entities/payroll-run.entity";
import { Payslip } from "./entities/payslip.entity";
import { EmployeesController } from "./employees/employees.controller";
import { EmployeesService } from "./employees/employees.service";
import { AttendanceController } from "./attendance/attendance.controller";
import { AttendanceService } from "./attendance/attendance.service";
import { PayrollController } from "./payroll/payroll.controller";
import { PayrollService } from "./payroll/payroll.service";

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeDetail, Attendance, PayrollRun, Payslip])],
  controllers: [EmployeesController, AttendanceController, PayrollController],
  providers: [EmployeesService, AttendanceService, PayrollService],
  exports: [TypeOrmModule],
})
export class HrModule {}
