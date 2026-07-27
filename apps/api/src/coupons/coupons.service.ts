import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { ListCouponsQueryDto } from "./dto/list-coupons-query.dto";
import {
  buildCouponsMeta,
  buildCouponsOrderBy,
  buildCouponsWhere,
  toCouponDto,
} from "./coupons.mapper";
import type { CouponsListResponse } from "./coupons.types";

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListCouponsQueryDto): Promise<CouponsListResponse> {
    const page = query.page;
    const perPage = query.perPage;
    const where = buildCouponsWhere(query);
    const orderBy = buildCouponsOrderBy(query);
    const skip = (page - 1) * perPage;

    const [total, rows] = await Promise.all([
      this.prisma.coupon.count({ where }),
      this.prisma.coupon.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: { partner: true },
      }),
    ]);

    return {
      data: rows.map(toCouponDto),
      meta: buildCouponsMeta(page, perPage, total),
    };
  }
}
