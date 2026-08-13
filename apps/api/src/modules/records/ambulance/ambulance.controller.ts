import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AmbulanceService } from "./ambulance.service";
import { AddAmbulanceDto, DispatchAmbulanceDto } from "../dto/ambulance.dto";

@Controller("ambulance")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AmbulanceController {
  constructor(private readonly ambulance: AmbulanceService) {}

  @Get("fleet")
  @Permissions("records.ambulance.read")
  listFleet() {
    return this.ambulance.listFleet();
  }

  @Get("trips")
  @Permissions("records.ambulance.read")
  listTrips() {
    return this.ambulance.listTrips();
  }

  @Post("fleet")
  @Permissions("records.ambulance.create")
  addVehicle(@Body() dto: AddAmbulanceDto) {
    return this.ambulance.addVehicle(dto);
  }

  @Post("trips")
  @Permissions("records.ambulance.dispatch")
  dispatch(@Body() dto: DispatchAmbulanceDto) {
    return this.ambulance.dispatch(dto);
  }

  @Post("trips/:id/complete")
  @Permissions("records.ambulance.dispatch")
  complete(@Param("id") id: string) {
    return this.ambulance.complete(id);
  }
}
