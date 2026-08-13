import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { BloodBankService } from "./blood-bank.service";
import { AddBloodUnitDto, IssueBloodUnitDto } from "../dto/blood-bank.dto";

@Controller("blood-bank")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BloodBankController {
  constructor(private readonly bloodBank: BloodBankService) {}

  @Get()
  @Permissions("records.blood_bank.read")
  list() {
    return this.bloodBank.list();
  }

  @Get("summary")
  @Permissions("records.blood_bank.read")
  summary() {
    return this.bloodBank.summary();
  }

  @Post()
  @Permissions("records.blood_bank.create")
  addUnit(@Body() dto: AddBloodUnitDto) {
    return this.bloodBank.addUnit(dto);
  }

  @Post(":id/issue")
  @Permissions("records.blood_bank.issue")
  issue(@Param("id") id: string, @Body() dto: IssueBloodUnitDto) {
    return this.bloodBank.issue(id, dto);
  }
}
