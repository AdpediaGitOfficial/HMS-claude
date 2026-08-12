import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { BedsService } from "./beds.service";

@Controller("beds")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BedsController {
  constructor(private readonly beds: BedsService) {}

  @Get("wards")
  @Permissions("clinical.ipd.read")
  listWards() {
    return this.beds.listWards();
  }

  @Get()
  @Permissions("clinical.ipd.read")
  listBeds() {
    return this.beds.listBeds();
  }
}
