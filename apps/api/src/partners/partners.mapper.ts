import type { Partner, Prisma } from "@prisma/client";
import type { ListPartnersQueryDto } from "./dto/list-partners-query.dto";
import type { PartnerDto, PartnersListMeta } from "./partners.types";

export function toPartnerDto(partner: Partner): PartnerDto {
  return {
    id: partner.id,
    name: partner.name,
    slug: partner.slug,
    category: partner.category,
    logo: partner.logo,
    website: partner.website,
    active: partner.active,
  };
}

export function buildPartnersWhere(
  query: ListPartnersQueryDto,
): Prisma.PartnerWhereInput {
  return {
    active: query.active,
  };
}

export function buildPartnersOrderBy(
  query: ListPartnersQueryDto,
): Prisma.PartnerOrderByWithRelationInput[] {
  const direction = query.order;
  const primary: Prisma.PartnerOrderByWithRelationInput =
    query.sort === "createdAt"
      ? { createdAt: direction }
      : { name: direction };

  return [primary, { id: "asc" }];
}

export function buildPartnersMeta(
  page: number,
  perPage: number,
  total: number,
): PartnersListMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);
  return {
    page,
    perPage,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
