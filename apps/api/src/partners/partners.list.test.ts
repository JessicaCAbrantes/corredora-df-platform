/**
 * Unit tests for PartnersService.list + mapper helpers.
 * Run: pnpm --filter api test
 */
import "reflect-metadata";
import type { Partner } from "@prisma/client";
import { ListPartnersQueryDto } from "./dto/list-partners-query.dto";
import {
  buildPartnersMeta,
  buildPartnersOrderBy,
  buildPartnersWhere,
  toPartnerDto,
} from "./partners.mapper";
import { PartnersService } from "./partners.service";

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
    website: "https://www.nike.com",
    active: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

type PrismaMock = {
  partner: {
    count: (args: unknown) => Promise<number>;
    findMany: (args: unknown) => Promise<Partner[]>;
  };
};

function createService(prisma: PrismaMock): PartnersService {
  return new PartnersService(prisma as never);
}

function defaultQuery(
  overrides: Partial<ListPartnersQueryDto> = {},
): ListPartnersQueryDto {
  const query = new ListPartnersQueryDto();
  Object.assign(query, overrides);
  return query;
}

async function main(): Promise<void> {
  // --- mapper ---
  const dto = toPartnerDto(basePartner());
  assert(dto.id === "ptr_01_nike", "dto id");
  assert(dto.slug === "nike-running", "dto slug");
  assert(dto.active === true, "dto active");

  const whereActive = buildPartnersWhere(defaultQuery({ active: true }));
  assert(whereActive.active === true, "where active true");

  const whereInactive = buildPartnersWhere(defaultQuery({ active: false }));
  assert(whereInactive.active === false, "where active false");

  const orderName = buildPartnersOrderBy(defaultQuery());
  assert(
    JSON.stringify(orderName[0]) === JSON.stringify({ name: "asc" }),
    "default sort name asc",
  );

  const meta = buildPartnersMeta(1, 8, 4);
  assert(meta.total === 4, "meta total");
  assert(meta.totalPages === 1, "meta totalPages");
  assert(meta.hasNextPage === false, "meta hasNextPage");

  const emptyMeta = buildPartnersMeta(1, 8, 0);
  assert(emptyMeta.totalPages === 0, "empty totalPages");

  // --- list success ---
  const rows = [
    basePartner(),
    basePartner({
      id: "ptr_02_asics",
      name: "ASICS",
      slug: "asics",
    }),
  ];

  let capturedWhere: unknown;
  let capturedOrderBy: unknown;
  let capturedSkip: unknown;
  let capturedTake: unknown;

  const service = createService({
    partner: {
      count: async () => 2,
      findMany: async (args: unknown) => {
        const a = args as {
          where: unknown;
          orderBy: unknown;
          skip: number;
          take: number;
        };
        capturedWhere = a.where;
        capturedOrderBy = a.orderBy;
        capturedSkip = a.skip;
        capturedTake = a.take;
        return rows;
      },
    },
  });

  const result = await service.list(defaultQuery({ page: 1, perPage: 8 }));
  assert(result.data.length === 2, "list returns rows");
  assert(result.meta.total === 2, "list meta total");
  assert(
    JSON.stringify(capturedWhere) === JSON.stringify({ active: true }),
    "list filters active=true by default",
  );
  assert(capturedSkip === 0, "skip page 1");
  assert(capturedTake === 8, "take perPage");
  assert(Array.isArray(capturedOrderBy), "orderBy array");

  // --- empty list ---
  const emptyService = createService({
    partner: {
      count: async () => 0,
      findMany: async () => [],
    },
  });
  const empty = await emptyService.list(defaultQuery());
  assert(empty.data.length === 0, "empty data");
  assert(empty.meta.total === 0, "empty total");

  // --- pagination page 2 ---
  const pageService = createService({
    partner: {
      count: async () => 10,
      findMany: async (args: unknown) => {
        const a = args as { skip: number; take: number };
        assert(a.skip === 8, "page 2 skip");
        assert(a.take === 8, "page 2 take");
        return [basePartner({ id: "ptr_page2" })];
      },
    },
  });
  const page2 = await pageService.list(defaultQuery({ page: 2, perPage: 8 }));
  assert(page2.meta.page === 2, "page 2 meta");
  assert(page2.meta.hasPreviousPage === true, "hasPreviousPage");
  assert(page2.meta.hasNextPage === false, "hasNextPage false on last page");
  assert(page2.meta.totalPages === 2, "totalPages 2");

  // --- sort createdAt desc ---
  const sortService = createService({
    partner: {
      count: async () => 1,
      findMany: async (args: unknown) => {
        const a = args as { orderBy: unknown };
        assert(
          JSON.stringify(a.orderBy) ===
            JSON.stringify([{ createdAt: "desc" }, { id: "asc" }]),
          "createdAt desc order",
        );
        return [basePartner()];
      },
    },
  });
  await sortService.list(
    defaultQuery({ sort: "createdAt", order: "desc" }),
  );

  console.log("partners.list.test.ts: all assertions passed");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
