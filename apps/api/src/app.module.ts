import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { typeOrmConfig } from "./config/typeorm.config";
import { TenantInterceptor } from "./common/tenant/tenant.interceptor";
import { PlatformModule } from "./modules/platform/platform.module";
import { CoreModule } from "./modules/core/core.module";
import { ClinicalModule } from "./modules/clinical/clinical.module";
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
    AuthModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: TenantInterceptor }],
})
export class AppModule {}
