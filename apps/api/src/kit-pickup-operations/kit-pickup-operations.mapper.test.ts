/**
 * Mapper checks — Kit Pickup Operations DTO extension.
 * Run: pnpm --filter api exec ts-node --project tsconfig.json src/kit-pickup-operations/kit-pickup-operations.mapper.test.ts
 */
import {
  EventCategory,
  EventLifecycleStatus,
  EventRegistrationMode,
  EventRegistrationStatus,
  KitPickupPaymentStatus,
  KitPickupRequestStatus,
  type Event,
  type KitPickupRequest,
  type KitPickupService,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { toOperationalRequestDto } from "./kit-pickup-operations.mapper";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function baseEvent(): Event {
  return {
    id: "evt_01",
    name: "Corrida Asa Norte",
    slug: "corrida-asa-norte",
    date: new Date("2026-08-16T10:00:00.000Z"),
    city: "Brasília",
    category: EventCategory.k5,
    distance: "5K",
    status: EventLifecycleStatus.active,
    registrationStatus: EventRegistrationStatus.open,
    registrationMode: EventRegistrationMode.internal,
    coverImage: "https://example.com/x.jpg",
    priceAmount: new Decimal(0),
    priceCurrency: "BRL",
    createdAt: new Date("2026-01-10T10:00:00.000Z"),
  };
}

function baseService(): KitPickupService & { event: Event } {
  return {
    id: "kps_01",
    eventId: "evt_01",
    title: "Retirada de kit",
    serviceAvailable: true,
    feeAmount: new Decimal(10),
    feeCurrency: "BRL",
    pickupLocation: "Asa Norte",
    pickupStartAt: new Date("2026-08-10T12:00:00.000Z"),
    pickupEndAt: new Date("2026-08-12T21:00:00.000Z"),
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    updatedAt: new Date("2026-07-01T00:00:00.000Z"),
    event: baseEvent(),
  };
}

function baseRequest(
  overrides: Partial<KitPickupRequest> = {},
): KitPickupRequest {
  return {
    id: "kpr_01",
    userId: "usr_01",
    kitPickupServiceId: "kps_01",
    registrationId: "reg_01",
    status: KitPickupRequestStatus.PICKUP_PENDING,
    paymentStatus: KitPickupPaymentStatus.PAID,
    feeAmountSnapshot: new Decimal(10),
    feeCurrencySnapshot: "BRL",
    pickedUpAt: null,
    pickedUpBy: null,
    custodyAt: null,
    custodyBy: null,
    readyAt: null,
    readyBy: null,
    deliveredAt: null,
    deliveredBy: null,
    receivedByName: null,
    handoverNotes: null,
    createdAt: new Date("2026-07-27T12:00:00.000Z"),
    updatedAt: new Date("2026-07-27T12:00:00.000Z"),
    ...overrides,
  };
}

function run(): void {
  const dto = toOperationalRequestDto({
    ...baseRequest(),
    kitPickupService: baseService(),
    participant: null,
    termAcceptance: null,
  });

  assert(dto.service.title === "Retirada de kit", "service.title");
  assert(dto.service.pickupLabel?.includes("Asa Norte"), "pickupLabel");
  assert(dto.registrationId === "reg_01", "registrationId");

  const external = toOperationalRequestDto({
    ...baseRequest({ registrationId: null }),
    kitPickupService: {
      ...baseService(),
      event: {
        ...baseEvent(),
        registrationMode: EventRegistrationMode.external,
      },
    },
    participant: {
      id: "ps_01",
      kitPickupRequestId: "kpr_01",
      fullName: "Ana",
      email: "ana@example.com",
      phone: "61999999999",
      externalRegistrationCode: "EXT-1",
      createdAt: new Date(),
    },
    termAcceptance: null,
  });

  assert(external.registrationId === null, "external registrationId null");
  assert(external.participant?.fullName === "Ana", "participant");

  console.log("kit-pickup-operations.mapper.test.ts: OK");
}

run();
