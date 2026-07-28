import { Controller, Get, Query } from "@nestjs/common";
import { ListKitPickupServicesQueryDto } from "./dto/list-kit-pickup-services-query.dto";
import { KitPickupServicesService } from "./kit-pickup-services.service";
import type { KitPickupServicesListResponse } from "./kit-pickup-services.types";

@Controller("kit-pickup-services")
export class KitPickupServicesController {
  constructor(
    private readonly kitPickupServicesService: KitPickupServicesService,
  ) {}

  /**
   * GET /api/v1/kit-pickup-services — public Home teaser catalog (Phase 1).
   */
  @Get()
  list(
    @Query() query: ListKitPickupServicesQueryDto,
  ): Promise<KitPickupServicesListResponse> {
    return this.kitPickupServicesService.list(query);
  }
}
