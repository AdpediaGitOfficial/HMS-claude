import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockItem } from "./entities/stock-item.entity";
import { DispenseRecord } from "./entities/dispense-record.entity";
import { StockController } from "./stock/stock.controller";
import { StockService } from "./stock/stock.service";
import { DispenseController } from "./dispense/dispense.controller";
import { DispenseService } from "./dispense/dispense.service";
import { ClinicalModule } from "../clinical/clinical.module";

@Module({
  imports: [TypeOrmModule.forFeature([StockItem, DispenseRecord]), ClinicalModule],
  controllers: [StockController, DispenseController],
  providers: [StockService, DispenseService],
  exports: [TypeOrmModule],
})
export class PharmacyModule {}
