import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { KitPickupOperationsController } from "./kit-pickup-operations.controller";
import { KitPickupOperationsService } from "./kit-pickup-operations.service";

@Module({
  imports: [PrismaModule],
  controllers: [KitPickupOperationsController],
  providers: [KitPickupOperationsService],
})
export class KitPickupOperationsModule {}
