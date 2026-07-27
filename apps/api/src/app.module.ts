import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { validateEnv } from "./config/env.validation";
import { CouponsModule } from "./coupons/coupons.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { PartnersModule } from "./partners/partners.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    EventsModule,
    PartnersModule,
    CouponsModule,
  ],
})
export class AppModule {}
