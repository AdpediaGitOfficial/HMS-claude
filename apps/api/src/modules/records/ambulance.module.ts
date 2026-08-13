import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ambulance } from "./entities/ambulance.entity";
import { AmbulanceTrip } from "./entities/ambulance-trip.entity";
import { AmbulanceController } from "./ambulance/ambulance.controller";
import { AmbulanceService } from "./ambulance/ambulance.service";

@Module({
  imports: [TypeOrmModule.forFeature([Ambulance, AmbulanceTrip])],
  controllers: [AmbulanceController],
  providers: [AmbulanceService],
  exports: [TypeOrmModule],
})
export class AmbulanceModule {}
