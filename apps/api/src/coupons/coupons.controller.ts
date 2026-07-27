import { Controller, Get, Query } from "@nestjs/common";
import { ListCouponsQueryDto } from "./dto/list-coupons-query.dto";
import { CouponsService } from "./coupons.service";
import type { CouponsListResponse } from "./coupons.types";

@Controller("coupons")
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * GET /api/v1/coupons — public Home teaser catalog (no code / no auth).
   */
  @Get()
  list(@Query() query: ListCouponsQueryDto): Promise<CouponsListResponse> {
    return this.couponsService.list(query);
  }
}
