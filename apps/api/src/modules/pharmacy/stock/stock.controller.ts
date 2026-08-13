import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { StockService } from "./stock.service";
import { CreateStockItemDto } from "../dto/create-stock-item.dto";

@Controller("pharmacy/stock")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StockController {
  constructor(private readonly stock: StockService) {}

  @Get()
  @Permissions("pharmacy.stock.read")
  list() {
    return this.stock.list();
  }

  @Get("low")
  @Permissions("pharmacy.stock.read")
  listLow() {
    return this.stock.listLow();
  }

  @Post()
  @Permissions("pharmacy.stock.create")
  create(@Body() dto: CreateStockItemDto) {
    return this.stock.create(dto);
  }
}
