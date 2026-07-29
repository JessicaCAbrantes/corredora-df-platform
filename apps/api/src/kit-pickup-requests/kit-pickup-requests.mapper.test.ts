/**
 * Mapper checks — Kit Pickup Request participant DTO (Experience MVP).
 * Run: pnpm --filter api exec ts-node --project tsconfig.json src/kit-pickup-requests/kit-pickup-requests.mapper.test.ts
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
import { toKitPickupRequestDto } from "./kit-pickup-requests.mapper";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function baseEvent(overrides: Partial<Event> = {}): Event {
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
    registrationMode: EventRegistrationMode.external,
    coverImage: "https://example.com/x.jpg",
    priceAmount: new Decimal(0),
    priceCurrency: "BRL",
    createdAt: new Date("2026-01-10T10:00:00.000Z"),
    ...overrides,
  };
}

function baseService(
  overrides: Partial<KitPickupService> & { event?: Event } = {},
): KitPickupService & { event: Event } {
  const { event, ...rest } = overrides;
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
    ...rest,
    event: event ?? baseEvent(),
  };
}

function baseRequest(
  overrides: Partial<KitPickupRequest> = {},
): KitPickupRequest {
  return {
    id: "kpr_01",
    userId: "usr_01",
    kitPickupServiceId: "kps_01",
    registrationId: null,
    status: KitPickupRequestStatus.IN_CUSTODY,
    paymentStatus: KitPickupPaymentStatus.PAID,
    feeAmountSnapshot: new Decimal(10),
    feeCurrencySnapshot: "BRL",
    pickedUpAt: new Date("2026-07-28T10:30:00.000Z"),
    pickedUpBy: "usr_operator",
    custodyAt: new Date("2026-07-28T11:00:00.000Z"),
    custodyBy: "usr_operator",
    readyAt: null,
    readyBy: null,
    deliveredAt: null,
    deliveredBy: null,
    receivedByName: null,
    handoverNotes: null,
    createdAt: new Date("2026-07-27T12:00:00.000Z"),
    updatedAt: new Date("2026-07-28T11:00:00.000Z"),
    ...overrides,
  };
}

function run(): void {
  const service = baseService();
  const dto = toKitPickupRequestDto({
    ...baseRequest(),
    kitPickupService: service,
    participant: {
      id: "ps_01",
      kitPickupRequestId: "kpr_01",
      fullName: "Jéssica",
      email: "j@example.com",
      phone: "61999999999",
      externalRegistrationCode: "123456",
      createdAt: new Date(),
    },
    termAcceptance: {
      id: "pta_01",
      kitPickupRequestId: "kpr_01",
      version: "v1",
      termContentHash: "abc",
      acceptedAt: new Date("2026-07-27T13:00:00.000Z"),
      acceptedByUserId: "usr_01",
    },
  });

  assert(dto.service.pickupLabel?.includes("Asa Norte"), "pickupLabel present");
  assert(dto.paymentStatusLabel === "Pagamento confirmado", "paymentStatusLabel");
  assert(dto.timeline.pickedUpAt !== null, "timeline.pickedUpAt");
  assert(dto.timeline.custodyAt !== null, "timeline.custodyAt");
  assert(dto.handover === null, "handover null before delivery");

  const delivered = toKitPickupRequestDto({
    ...baseRequest({
      status: KitPickupRequestStatus.DELIVERED,
      deliveredAt: new Date("2026-07-28T15:30:00.000Z"),
      deliveredBy: "usr_operator",
      receivedByName: "Jéssica Abrantes",
      handoverNotes: "Entregue no ponto combinado.",
    }),
    kitPickupService: service,
    participant: null,
    termAcceptance: null,
  });

  assert(delivered.handover !== null, "handover when delivered");
  assert(
    delivered.handover?.receivedByName === "Jéssica Abrantes",
    "receivedByName",
  );
  assert(
    delivered.handover?.notes === "Entregue no ponto combinado.",
    "handover notes",
  );

  const json = JSON.stringify(delivered);
  assert(!json.includes("pickedUpBy"), "no pickedUpBy");
  assert(!json.includes("custodyBy"), "no custodyBy");
  assert(!json.includes("readyBy"), "no readyBy");
  assert(!json.includes("deliveredBy"), "no deliveredBy");
  assert(!json.includes("usr_operator"), "no operator ids");

  const noPickup = toKitPickupRequestDto({
    ...baseRequest(),
    kitPickupService: baseService({
      pickupLocation: null,
      pickupStartAt: null,
      pickupEndAt: null,
    }),
    participant: null,
    termAcceptance: null,
  });
  assert(noPickup.service.pickupLabel === null, "null pickupLabel");

  console.log("kit-pickup-requests.mapper.test.ts: OK");
}

run();
