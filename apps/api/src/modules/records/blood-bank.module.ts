import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BloodUnit } from "./entities/blood-unit.entity";
import { BloodBankController } from "./blood-bank/blood-bank.controller";
import { BloodBankService } from "./blood-bank/blood-bank.service";

/**
 * Lives in the `records` schema alongside Ambulance, Referral, and Birth &
 * Death Record (§3) — those aren't built yet, so this module only wires
 * Blood Bank for now rather than a misleadingly-named empty "RecordsModule".
 */
@Module({
  imports: [TypeOrmModule.forFeature([BloodUnit])],
  controllers: [BloodBankController],
  providers: [BloodBankService],
  exports: [TypeOrmModule],
})
export class BloodBankModule {}
