import { Controller, Get, Query } from "@nestjs/common";
import { ListPartnersQueryDto } from "./dto/list-partners-query.dto";
import { PartnersService } from "./partners.service";
import type { PartnersListResponse } from "./partners.types";

@Controller("partners")
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  /**
   * GET /api/v1/partners — public partners catalog (Home MVP).
   */
  @Get()
  list(@Query() query: ListPartnersQueryDto): Promise<PartnersListResponse> {
    return this.partnersService.list(query);
  }
}
