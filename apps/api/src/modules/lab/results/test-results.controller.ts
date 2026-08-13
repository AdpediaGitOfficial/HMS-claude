import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { TestResultsService } from "./test-results.service";
import { EnterResultDto, OrderTestDto } from "../dto/order-test.dto";

@Controller("lab/results")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TestResultsController {
  constructor(private readonly results: TestResultsService) {}

  @Get("pending")
  @Permissions("lab.results.read")
  listPending() {
    return this.results.listPending();
  }

  @Post("order")
  @Permissions("lab.results.order")
  orderTest(@Body() dto: OrderTestDto) {
    return this.results.orderTest(dto);
  }

  @Post(":id/report")
  @Permissions("lab.results.report")
  enterResult(@Param("id") id: string, @Body() dto: EnterResultDto) {
    return this.results.enterResult(id, dto);
  }
}
