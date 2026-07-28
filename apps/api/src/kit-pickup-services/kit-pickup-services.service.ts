import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { ListKitPickupServicesQueryDto } from "./dto/list-kit-pickup-services-query.dto";
import {
  buildKitPickupServicesMeta,
  buildKitPickupServicesOrderBy,
  buildKitPickupServicesWhere,
  toKitPickupServiceDto,
} from "./kit-pickup-services.mapper";
import type { KitPickupServicesListResponse } from "./kit-pickup-services.types";

@Injectable()
export class KitPickupServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: ListKitPickupServicesQueryDto,
  ): Promise<KitPickupServicesListResponse> {
    const page = query.page;
    const perPage = query.perPage;
    const where = buildKitPickupServicesWhere(query);
    const orderBy = buildKitPickupServicesOrderBy(query);
    const skip = (page - 1) * perPage;

    const [total, rows] = await Promise.all([
      this.prisma.kitPickupService.count({ where }),
      this.prisma.kitPickupService.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: { event: true },
      }),
    ]);

    return {
      data: rows.map((row) => toKitPickupServiceDto(row)),
      meta: buildKitPickupServicesMeta(page, perPage, total),
    };
  }
}
