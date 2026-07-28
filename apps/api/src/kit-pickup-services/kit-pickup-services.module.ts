import { Module } from "@nestjs/common";
import { KitPickupServicesController } from "./kit-pickup-services.controller";
import { KitPickupServicesService } from "./kit-pickup-services.service";

@Module({
  controllers: [KitPickupServicesController],
  providers: [KitPickupServicesService],
})
export class KitPickupServicesModule {}
