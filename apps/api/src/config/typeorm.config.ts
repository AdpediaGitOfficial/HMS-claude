import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Tenant } from "../modules/platform/entities/tenant.entity";
import { Branch } from "../modules/platform/entities/branch.entity";
import { User } from "../modules/core/entities/user.entity";
import { Role } from "../modules/core/entities/role.entity";
import { Permission } from "../modules/core/entities/permission.entity";
import { RolePermission } from "../modules/core/entities/role-permission.entity";
import { UserRole } from "../modules/core/entities/user-role.entity";
import { Patient } from "../modules/core/entities/patient.entity";
import { Appointment } from "../modules/clinical/entities/appointment.entity";
import { Encounter } from "../modules/clinical/entities/encounter.entity";
import { ClinicalNote } from "../modules/clinical/entities/clinical-note.entity";
import { Ward } from "../modules/clinical/entities/ward.entity";
import { Bed } from "../modules/clinical/entities/bed.entity";
import { Admission } from "../modules/clinical/entities/admission.entity";
import { Order } from "../modules/clinical/entities/order.entity";
import { StockItem } from "../modules/pharmacy/entities/stock-item.entity";
import { DispenseRecord } from "../modules/pharmacy/entities/dispense-record.entity";
import { TestCatalog } from "../modules/lab/entities/test-catalog.entity";
import { TestResult } from "../modules/lab/entities/test-result.entity";
import { BloodUnit } from "../modules/records/entities/blood-unit.entity";

export const entities = [
  Tenant,
  Branch,
  User,
  Role,
  Permission,
  RolePermission,
  UserRole,
  Patient,
  Appointment,
  Encounter,
  ClinicalNote,
  Ward,
  Bed,
  Admission,
  Order,
  StockItem,
  DispenseRecord,
  TestCatalog,
  TestResult,
  BloodUnit,
];

export function typeOrmConfig(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: "postgres",
    url: config.getOrThrow<string>("DATABASE_URL"),
    entities,
    // Migrations only — never true outside a throwaway local sandbox.
    // Schema changes always go through a reviewed, additive migration (§11).
    synchronize: false,
    logging: config.get("NODE_ENV") !== "production",
  };
}
