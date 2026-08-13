import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { typeOrmConfig } from "./config/typeorm.config";
import { TenantInterceptor } from "./common/tenant/tenant.interceptor";
import { PlatformModule } from "./modules/platform/platform.module";
import { CoreModule } from "./modules/core/core.module";
import { ClinicalModule } from "./modules/clinical/clinical.module";
import { PharmacyModule } from "./modules/pharmacy/pharmacy.module";
import { LabModule } from "./modules/lab/lab.module";
import { BloodBankModule } from "./modules/records/blood-bank.module";
import { AmbulanceModule } from "./modules/records/ambulance.module";
import { ReferralModule } from "./modules/records/referral.module";
import { VitalRecordsModule } from "./modules/records/vital-records.module";
import { BillingModule } from "./modules/billing/billing.module";
import { HrModule } from "./modules/hr/hr.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    PlatformModule,
    CoreModule,
    ClinicalModule,
    PharmacyModule,
    LabModule,
    BloodBankModule,
    AmbulanceModule,
    ReferralModule,
    VitalRecordsModule,
    BillingModule,
    HrModule,
    ReportsModule,
    AuthModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: TenantInterceptor }],
})
export class AppModule {}
