import type { Coupon, Partner, Prisma } from "@prisma/client";
import type { ListCouponsQueryDto } from "./dto/list-coupons-query.dto";
import type { CouponDto, CouponsListMeta } from "./coupons.types";

export type CouponWithPartner = Coupon & {
  partner: Partner | null;
};

export function toCouponDto(row: CouponWithPartner): CouponDto {
  return {
    id: row.id,
    title: row.title,
    discountLabel: row.discountLabel,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    active: row.active,
    partner: row.partner
      ? {
          id: row.partner.id,
          name: row.partner.name,
          slug: row.partner.slug,
        }
      : null,
  };
}

export function buildCouponsWhere(
  query: ListCouponsQueryDto,
): Prisma.CouponWhereInput {
  return {
    active: query.active,
  };
}

export function buildCouponsOrderBy(
  query: ListCouponsQueryDto,
): Prisma.CouponOrderByWithRelationInput[] {
  const direction = query.order;
  const primary: Prisma.CouponOrderByWithRelationInput =
    query.sort === "title"
      ? { title: direction }
      : query.sort === "createdAt"
        ? { createdAt: direction }
        : { expiresAt: direction };

  return [primary, { id: "asc" }];
}

export function buildCouponsMeta(
  page: number,
  perPage: number,
  total: number,
): CouponsListMeta {
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
