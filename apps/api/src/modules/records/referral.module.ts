import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Referral } from "./entities/referral.entity";
import { ReferralController } from "./referral/referral.controller";
import { ReferralService } from "./referral/referral.service";

@Module({
  imports: [TypeOrmModule.forFeature([Referral])],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [TypeOrmModule],
})
export class ReferralModule {}
