import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { TpaProvidersService } from "./tpa-providers.service";
import { CreateTpaProviderDto } from "../dto/create-tpa-provider.dto";

@Controller("billing/tpa-providers")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TpaProvidersController {
  constructor(private readonly providers: TpaProvidersService) {}

  @Get()
  @Permissions("billing.tpa_providers.read")
  list() {
    return this.providers.list();
  }

  @Post()
  @Permissions("billing.tpa_providers.create")
  create(@Body() dto: CreateTpaProviderDto) {
    return this.providers.create(dto);
  }
}
