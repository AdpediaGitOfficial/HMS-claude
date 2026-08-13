import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { TestCatalogService } from "./test-catalog.service";
import { CreateTestCatalogDto } from "../dto/create-test-catalog.dto";
import { TestCategory } from "../entities/test-catalog.entity";

@Controller("lab/catalog")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TestCatalogController {
  constructor(private readonly catalog: TestCatalogService) {}

  @Get()
  @Permissions("lab.results.read")
  list(@Query("category") category?: TestCategory) {
    return this.catalog.list(category);
  }

  @Post()
  @Permissions("lab.catalog.create")
  create(@Body() dto: CreateTestCatalogDto) {
    return this.catalog.create(dto);
  }
}
