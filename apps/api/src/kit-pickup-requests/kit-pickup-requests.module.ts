import { Module } from "@nestjs/common";
import { PaymentsModule } from "../payments/payments.module";
import { PrismaModule } from "../prisma/prisma.module";
import { KitPickupRequestsController } from "./kit-pickup-requests.controller";
import { KitPickupRequestsService } from "./kit-pickup-requests.service";

@Module({
  imports: [PrismaModule, PaymentsModule],
  controllers: [KitPickupRequestsController],
  providers: [KitPickupRequestsService],
})
export class KitPickupRequestsModule {}
