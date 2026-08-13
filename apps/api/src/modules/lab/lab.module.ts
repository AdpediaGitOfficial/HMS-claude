import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TestCatalog } from "./entities/test-catalog.entity";
import { TestResult } from "./entities/test-result.entity";
import { TestCatalogController } from "./catalog/test-catalog.controller";
import { TestCatalogService } from "./catalog/test-catalog.service";
import { TestResultsController } from "./results/test-results.controller";
import { TestResultsService } from "./results/test-results.service";
import { ClinicalModule } from "../clinical/clinical.module";

@Module({
  imports: [TypeOrmModule.forFeature([TestCatalog, TestResult]), ClinicalModule],
  controllers: [TestCatalogController, TestResultsController],
  providers: [TestCatalogService, TestResultsService],
  exports: [TypeOrmModule],
})
export class LabModule {}
