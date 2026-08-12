import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tenant } from "./entities/tenant.entity";
import { Branch } from "./entities/branch.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Branch])],
  exports: [TypeOrmModule],
})
export class PlatformModule {}
