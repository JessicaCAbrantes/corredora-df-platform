import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { ListPartnersQueryDto } from "./dto/list-partners-query.dto";
import {
  buildPartnersMeta,
  buildPartnersOrderBy,
  buildPartnersWhere,
  toPartnerDto,
} from "./partners.mapper";
import type { PartnersListResponse } from "./partners.types";

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListPartnersQueryDto): Promise<PartnersListResponse> {
    const page = query.page;
    const perPage = query.perPage;
    const where = buildPartnersWhere(query);
    const orderBy = buildPartnersOrderBy(query);
    const skip = (page - 1) * perPage;

    const [total, rows] = await Promise.all([
      this.prisma.partner.count({ where }),
      this.prisma.partner.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
    ]);

    return {
      data: rows.map(toPartnerDto),
      meta: buildPartnersMeta(page, perPage, total),
    };
  }
}
