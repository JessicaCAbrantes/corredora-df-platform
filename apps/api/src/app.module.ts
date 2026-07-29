import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { BlogModule } from "./blog/blog.module";
import { validateEnv } from "./config/env.validation";
import { CouponsModule } from "./coupons/coupons.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { KitPickupOperationsModule } from "./kit-pickup-operations/kit-pickup-operations.module";
import { KitPickupRequestsModule } from "./kit-pickup-requests/kit-pickup-requests.module";
import { KitPickupServicesModule } from "./kit-pickup-services/kit-pickup-services.module";
import { PartnersModule } from "./partners/partners.module";
import { PaymentsModule } from "./payments/payments.module";
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
    BlogModule,
    KitPickupServicesModule,
    PaymentsModule,
    KitPickupOperationsModule,
    KitPickupRequestsModule,
  ],
})
export class AppModule {}
