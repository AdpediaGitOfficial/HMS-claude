import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLog } from "../core/entities/audit-log.entity";
import { Patient } from "../core/entities/patient.entity";
import { Appointment } from "../clinical/entities/appointment.entity";
import { Admission } from "../clinical/entities/admission.entity";
import { Payment } from "../billing/entities/payment.entity";
import { StockItem } from "../pharmacy/entities/stock-item.entity";
import { TestResult } from "../lab/entities/test-result.entity";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { AuditService } from "./audit.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, Patient, Appointment, Admission, Payment, StockItem, TestResult]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, AuditService],
})
export class ReportsModule {}
