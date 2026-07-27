/**
 * Unit tests for CouponsService.list + mapper helpers.
 * Run: pnpm --filter api test
 */
import "reflect-metadata";
import type { Partner } from "@prisma/client";
import { ListCouponsQueryDto } from "./dto/list-coupons-query.dto";
import {
  buildCouponsMeta,
  buildCouponsOrderBy,
  buildCouponsWhere,
  toCouponDto,
  type CouponWithPartner,
} from "./coupons.mapper";
import { CouponsService } from "./coupons.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function basePartner(overrides: Partial<Partner> = {}): Partner {
  return {
    id: "ptr_01_nike",
    name: "Nike Running",
    slug: "nike-running",
    category: "Equipamento",
    logo: null,
    website: null,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function baseCoupon(overrides: Partial<CouponWithPartner> = {}): CouponWithPartner {
  return {
    id: "cpn_02_running",
    title: "Desconto em inscrição selecionada",
    discountLabel: "15% OFF",
    expiresAt: new Date("2026-12-31T23:59:59.000Z"),
    active: true,
    partnerId: "ptr_01_nike",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    partner: basePartner(),
    ...overrides,
  };
}

type PrismaMock = {
  coupon: {
    count: (args: unknown) => Promise<number>;
    findMany: (args: unknown) => Promise<CouponWithPartner[]>;
  };
};

function createService(prisma: PrismaMock): CouponsService {
  return new CouponsService(prisma as never);
}

function defaultQuery(
  overrides: Partial<ListCouponsQueryDto> = {},
): ListCouponsQueryDto {
  const query = new ListCouponsQueryDto();
  Object.assign(query, overrides);
  return query;
}

async function main(): Promise<void> {
  const withPartner = toCouponDto(baseCoupon());
  assert(withPartner.discountLabel === "15% OFF", "discountLabel");
  assert(withPartner.partner?.name === "Nike Running", "partner name");
  assert(!("code" in withPartner), "no code field");
  assert(!("partnerId" in withPartner), "no partnerId on public dto");

  const withoutPartner = toCouponDto(
    baseCoupon({
      id: "cpn_01_welcome",
      partnerId: null,
      partner: null,
    }),
  );
  assert(withoutPartner.partner === null, "partner null");

  assert(
    buildCouponsWhere(defaultQuery({ active: true })).active === true,
    "active true",
  );
  assert(
    buildCouponsWhere(defaultQuery({ active: false })).active === false,
    "active false",
  );

  const order = buildCouponsOrderBy(defaultQuery());
  assert(
    JSON.stringify(order[0]) === JSON.stringify({ expiresAt: "asc" }),
    "default sort expiresAt asc",
  );

  const meta = buildCouponsMeta(1, 4, 4);
  assert(meta.totalPages === 1, "meta pages");
  assert(meta.hasNextPage === false, "meta next");

  let capturedInclude: unknown;
  const service = createService({
    coupon: {
      count: async () => 2,
      findMany: async (args: unknown) => {
        const a = args as {
          where: unknown;
          orderBy: unknown;
          skip: number;
          take: number;
          include: unknown;
        };
        capturedInclude = a.include;
        assert(
          JSON.stringify(a.where) === JSON.stringify({ active: true }),
          "where active",
        );
        assert(a.skip === 0 && a.take === 4, "pagination");
        return [
          baseCoupon(),
          baseCoupon({
            id: "cpn_01_welcome",
            partnerId: null,
            partner: null,
          }),
        ];
      },
    },
  });

  const result = await service.list(defaultQuery());
  assert(result.data.length === 2, "list length");
  assert(result.data[0]!.partner !== null, "first has partner");
  assert(result.data[1]!.partner === null, "second no partner");
  assert(
    JSON.stringify(capturedInclude) === JSON.stringify({ partner: true }),
    "include partner",
  );
  assert(
    !JSON.stringify(result).includes('"code"'),
    "response json has no code",
  );

  const empty = await createService({
    coupon: {
      count: async () => 0,
      findMany: async () => [],
    },
  }).list(defaultQuery());
  assert(empty.data.length === 0 && empty.meta.total === 0, "empty list");

  await createService({
    coupon: {
      count: async () => 1,
      findMany: async (args: unknown) => {
        const a = args as { orderBy: unknown };
        assert(
          JSON.stringify(a.orderBy) ===
            JSON.stringify([{ title: "desc" }, { id: "asc" }]),
          "title desc",
        );
        return [baseCoupon()];
      },
    },
  }).list(defaultQuery({ sort: "title", order: "desc" }));

  console.log("coupons.list.test.ts: all assertions passed");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
