import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { ReferralService } from "./referral.service";
import { CreateReferralDto, UpdateReferralStatusDto } from "../dto/referral.dto";

@Controller("referrals")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReferralController {
  constructor(private readonly referrals: ReferralService) {}

  @Get()
  @Permissions("records.referrals.read")
  list() {
    return this.referrals.list();
  }

  @Post()
  @Permissions("records.referrals.create")
  create(@Body() dto: CreateReferralDto) {
    return this.referrals.create(dto);
  }

  @Post(":id/status")
  @Permissions("records.referrals.update")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateReferralStatusDto) {
    return this.referrals.updateStatus(id, dto);
  }
}
