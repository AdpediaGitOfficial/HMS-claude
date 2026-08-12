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

export const entities = [Tenant, Branch, User, Role, Permission, RolePermission, UserRole, Patient];

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
