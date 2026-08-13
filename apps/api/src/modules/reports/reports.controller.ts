import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ReportsService } from "./reports.service";
import { AuditService } from "./audit.service";

@Controller("reports")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly audit: AuditService,
  ) {}

  @Get("summary")
  @Permissions("reports.summary.read")
  summary() {
    return this.reports.summary();
  }

  @Get("audit-log")
  @Permissions("reports.audit.read")
  auditLog() {
    return this.audit.recent();
  }
}
