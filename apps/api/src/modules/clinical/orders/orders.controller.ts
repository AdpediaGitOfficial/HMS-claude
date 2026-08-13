import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "../dto/create-order.dto";
import { OrderType } from "../entities/order.entity";

@Controller("orders")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get("by-encounter/:encounterId")
  @Permissions("clinical.orders.read")
  listForEncounter(@Param("encounterId") encounterId: string) {
    return this.orders.listForEncounter(encounterId);
  }

  @Get("pending")
  @Permissions("clinical.orders.read")
  listPending(@Query("type") type: OrderType) {
    return this.orders.listPending(type);
  }

  @Post()
  @Permissions("clinical.orders.create")
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
  }
}
