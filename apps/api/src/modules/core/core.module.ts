import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { RolePermission } from "./entities/role-permission.entity";
import { UserRole } from "./entities/user-role.entity";
import { Patient } from "./entities/patient.entity";
import { PatientsController } from "./patients/patients.controller";
import { PatientsService } from "./patients/patients.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, RolePermission, UserRole, Patient])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [TypeOrmModule],
})
export class CoreModule {}
