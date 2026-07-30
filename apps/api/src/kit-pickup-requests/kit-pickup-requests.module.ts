import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PaymentsModule } from "../payments/payments.module";
import { PrismaModule } from "../prisma/prisma.module";
import { KitPickupRequestsController } from "./kit-pickup-requests.controller";
import { KitPickupRequestsService } from "./kit-pickup-requests.service";

@Module({
  imports: [PrismaModule, PaymentsModule, AuthModule],
  controllers: [KitPickupRequestsController],
  providers: [KitPickupRequestsService],
})
export class KitPickupRequestsModule {}
