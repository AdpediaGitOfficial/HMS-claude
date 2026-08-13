import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { DispenseService } from "./dispense.service";
import { DispenseDto } from "../dto/dispense.dto";

@Controller("pharmacy/dispense")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DispenseController {
  constructor(private readonly dispense: DispenseService) {}

  @Get("by-order/:orderId")
  @Permissions("pharmacy.dispense.read")
  listForOrder(@Param("orderId") orderId: string) {
    return this.dispense.listForOrder(orderId);
  }

  @Post()
  @Permissions("pharmacy.dispense.create")
  create(@Body() dto: DispenseDto) {
    return this.dispense.dispense(dto);
  }
}
