import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BirthRecord } from "./entities/birth-record.entity";
import { DeathRecord } from "./entities/death-record.entity";
import { VitalRecordsController } from "./vital-records/vital-records.controller";
import { VitalRecordsService } from "./vital-records/vital-records.service";

@Module({
  imports: [TypeOrmModule.forFeature([BirthRecord, DeathRecord])],
  controllers: [VitalRecordsController],
  providers: [VitalRecordsService],
  exports: [TypeOrmModule],
})
export class VitalRecordsModule {}
