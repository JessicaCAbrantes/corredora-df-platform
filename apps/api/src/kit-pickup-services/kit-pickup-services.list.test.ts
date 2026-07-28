/**
 * Unit tests for KitPickupServicesService.list + mapper helpers.
 * Run: pnpm --filter api test
 */
import "reflect-metadata";
import {
  EventCategory,
  EventLifecycleStatus,
  EventRegistrationMode,
  EventRegistrationStatus,
  type Event,
  type KitPickupService,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ListKitPickupServicesQueryDto } from "./dto/list-kit-pickup-services-query.dto";
import {
  buildKitPickupServicesMeta,
  buildKitPickupServicesOrderBy,
  buildKitPickupServicesWhere,
  buildPickupLabel,
  buildStatusLabel,
  toKitPickupServiceDto,
  type KitPickupServiceWithEvent,
} from "./kit-pickup-services.mapper";
import { KitPickupServicesService } from "./kit-pickup-services.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function baseEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "evt_01_meia",
    name: "Meia Maratona de Brasília",
    slug: "meia-maratona-brasilia",
    date: new Date("2026-08-16T10:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.half_marathon,
    distance: "21K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.open,
    registrationMode: EventRegistrationMode.internal,
    coverImage: "https://example.com/events/meia.jpg",
    priceAmount: new Decimal(149),
    priceCurrency: "BRL",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function baseService(
  overrides: Partial<KitPickupServiceWithEvent> = {},
): KitPickupServiceWithEvent {
  return {
    id: "kps_01_own_event",
    eventId: "evt_01_meia",
    title: "Retirada de kit",
    serviceAvailable: true,
    feeAmount: null,
    feeCurrency: "BRL",
    pickupLocation: "Asa Norte",
    pickupStartAt: new Date("2026-08-10T12:00:00.000Z"),
    pickupEndAt: new Date("2026-08-12T21:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    event: baseEvent(),
    ...overrides,
  };
}

type PrismaMock = {
  kitPickupService: {
    count: (args: unknown) => Promise<number>;
    findMany: (args: unknown) => Promise<KitPickupServiceWithEvent[]>;
  };
};

function createService(prisma: PrismaMock): KitPickupServicesService {
  return new KitPickupServicesService(prisma as never);
}

function defaultQuery(
  overrides: Partial<ListKitPickupServicesQueryDto> = {},
): ListKitPickupServicesQueryDto {
  const query = new ListKitPickupServicesQueryDto();
  Object.assign(query, overrides);
  return query;
}

async function main(): Promise<void> {
  const now = new Date("2026-07-01T12:00:00.000Z");
  const dto = toKitPickupServiceDto(baseService(), now);
  assert(dto.statusLabel === "Retirada em breve", "statusLabel future");
  assert(dto.pickupLabel?.includes("Asa Norte") === true, "pickup location");
  assert(dto.registrationMode === "internal", "registrationMode internal");
  assert(dto.feeAmount === null, "fee null");
  assert(!("userId" in dto), "no userId");
  assert(!("paymentStatus" in dto), "no paymentStatus");
  assert(!("participant" in dto), "no participant");

  const thirdParty = toKitPickupServiceDto(
    baseService({
      id: "kps_02_third_party",
      feeAmount: new Decimal(10),
      event: baseEvent({
        id: "evt_03_5k_ini",
        name: "5K Iniciantes DF",
        slug: "5k-iniciantes-df",
        registrationMode: EventRegistrationMode.external,
      }),
    }),
    now,
  );
  assert(thirdParty.registrationMode === "external", "external mode");
  assert(thirdParty.feeAmount === "10.00", "fee formatted");

  assert(
    buildStatusLabel(
      baseService({ serviceAvailable: false }) as KitPickupService,
      now,
    ) === "Indisponível",
    "unavailable status",
  );
  assert(
    buildPickupLabel(
      baseService({
        pickupLocation: null,
        pickupStartAt: null,
        pickupEndAt: null,
      }) as KitPickupService,
    ) === null,
    "empty pickup label",
  );

  assert(
    buildKitPickupServicesWhere(defaultQuery()).serviceAvailable === true,
    "default available",
  );
  assert(
    buildKitPickupServicesWhere(defaultQuery({ serviceAvailable: false }))
      .serviceAvailable === false,
    "filter unavailable",
  );

  const order = buildKitPickupServicesOrderBy(defaultQuery());
  assert(
    JSON.stringify(order[0]) === JSON.stringify({ pickupStartAt: "asc" }),
    "default sort",
  );

  const meta = buildKitPickupServicesMeta(1, 4, 2);
  assert(meta.totalPages === 1 && meta.hasNextPage === false, "meta");

  const service = createService({
    kitPickupService: {
      count: async () => 2,
      findMany: async (args: unknown) => {
        const a = args as {
          where: unknown;
          skip: number;
          take: number;
          include: unknown;
        };
        assert(
          JSON.stringify(a.where) ===
            JSON.stringify({ serviceAvailable: true }),
          "where",
        );
        assert(a.skip === 0 && a.take === 4, "pagination");
        assert(
          JSON.stringify(a.include) === JSON.stringify({ event: true }),
          "include event",
        );
        return [baseService(), baseService({ id: "kps_02_third_party" })];
      },
    },
  });

  const result = await service.list(defaultQuery());
  assert(result.data.length === 2, "list length");
  assert(result.meta.total === 2, "meta total");
  assert(
    !JSON.stringify(result).includes('"email"'),
    "no email in response",
  );
  assert(
    !JSON.stringify(result).includes('"cpf"'),
    "no cpf in response",
  );

  const empty = await createService({
    kitPickupService: {
      count: async () => 0,
      findMany: async () => [],
    },
  }).list(defaultQuery());
  assert(empty.data.length === 0 && empty.meta.total === 0, "empty");

  await createService({
    kitPickupService: {
      count: async () => 1,
      findMany: async (args: unknown) => {
        const a = args as { orderBy: unknown };
        assert(
          JSON.stringify(a.orderBy) ===
            JSON.stringify([{ title: "desc" }, { id: "asc" }]),
          "title desc",
        );
        return [baseService()];
      },
    },
  }).list(defaultQuery({ sort: "title", order: "desc" }));

  console.log("kit-pickup-services.list.test.ts: all assertions passed");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
