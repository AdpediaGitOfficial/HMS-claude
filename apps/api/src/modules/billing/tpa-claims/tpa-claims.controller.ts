import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { TpaClaimsService } from "./tpa-claims.service";
import { SubmitTpaClaimDto, UpdateTpaClaimStatusDto } from "../dto/tpa-claim.dto";

@Controller("billing/tpa-claims")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TpaClaimsController {
  constructor(private readonly claims: TpaClaimsService) {}

  @Get()
  @Permissions("billing.tpa_claims.read")
  list() {
    return this.claims.list();
  }

  @Post()
  @Permissions("billing.tpa_claims.create")
  submit(@Body() dto: SubmitTpaClaimDto) {
    return this.claims.submit(dto);
  }

  @Post(":id/status")
  @Permissions("billing.tpa_claims.update")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateTpaClaimStatusDto) {
    return this.claims.updateStatus(id, dto);
  }
}
