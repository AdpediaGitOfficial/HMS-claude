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
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, RolePermission, UserRole, Patient])],
  controllers: [PatientsController, UsersController],
  providers: [PatientsService, UsersService],
  exports: [TypeOrmModule],
})
export class CoreModule {}
