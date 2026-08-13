import { Injectable } from "@nestjs/common";
import { Between } from "typeorm";
import { Patient } from "../core/entities/patient.entity";
import { Appointment } from "../clinical/entities/appointment.entity";
import { Admission } from "../clinical/entities/admission.entity";
import { Payment } from "../billing/entities/payment.entity";
import { StockItem } from "../pharmacy/entities/stock-item.entity";
import { TestResult } from "../lab/entities/test-result.entity";
import { tenantManager } from "../../common/tenant/tenant-context";

/**
 * Pulls a lightweight cross-module snapshot rather than owning any data
 * itself — every number here comes from a module built earlier, proving
 * the spine-and-companion-table design (§11) lets a reporting module read
 * across the whole system without any of those modules knowing it exists.
 */
@Injectable()
export class ReportsService {
  async summary() {
    const manager = tenantManager();
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPatients, todaysAppointments, activeAdmissions, payments, stockItems, pendingLabResults] =
      await Promise.all([
        manager.getRepository(Patient).count(),
        manager.getRepository(Appointment).count({ where: { scheduledAt: Between(startOfDay, endOfDay) } }),
        manager.getRepository(Admission).count({ where: { status: "admitted" } }),
        manager.getRepository(Payment).find({ where: { paidAt: Between(startOfMonth, now) } }),
        manager.getRepository(StockItem).find(),
        manager.getRepository(TestResult).count({ where: { resultStatus: "pending" } }),
      ]);

    const revenueThisMonth = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const lowStockCount = stockItems.filter((s) => s.quantityOnHand <= s.reorderLevel).length;

    return {
      totalPatients,
      todaysAppointments,
      activeAdmissions,
      revenueThisMonth: revenueThisMonth.toFixed(2),
      lowStockCount,
      pendingLabResults,
    };
  }
}
