/**
 * Minimal mapper checks for Event Details MVP A.
 * Run: pnpm --filter api exec ts-node --project tsconfig.json src/events/events.mapper.details.test.ts
 */
import {
  EventCategory,
  EventLifecycleStatus,
  EventRegistrationMode,
  EventRegistrationStatus,
  type Event,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { toEventDetailsDto } from "./events.mapper";

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
    createdAt: new Date("2026-01-10T10:00:00.000Z"),
    ...overrides,
  };
}

function run(): void {
  const paidOpen = toEventDetailsDto(baseEvent());
  assert(paidOpen.id === "evt_01_meia", "id preserved");
  assert(paidOpen.slug === "meia-maratona-brasilia", "slug preserved");
  assert(paidOpen.registrationStatus === "open", "open status");
  assert(paidOpen.registrationOpen === true, "registrationOpen true");
  assert(paidOpen.price?.amount === 149, "paid amount");
  assert(paidOpen.price?.currency === "BRL", "paid currency");
  assert(paidOpen.coverImage.includes("meia.jpg"), "coverImage");
  assert(paidOpen.kit.available === false, "kit degraded");
  assert(
    paidOpen.kit.description === "Informações do kit em breve.",
    "kit description",
  );
  assert(paidOpen.route.available === false, "route degraded");
  assert(paidOpen.route.distanceLabel === "21K", "route distanceLabel");
  assert(paidOpen.schedule.items.length === 0, "empty schedule");
  assert(paidOpen.regulation.href === "#regulamento", "regulation href");

  const free = toEventDetailsDto(
    baseEvent({
      id: "evt_03_5k_ini",
      slug: "5k-iniciantes-df",
      priceAmount: null,
      priceCurrency: null,
      registrationStatus: EventRegistrationStatus.upcoming,
    registrationMode: EventRegistrationMode.internal,
    }),
  );
  assert(free.price === null, "free price null");
  assert(free.registrationStatus === "upcoming", "upcoming");
  assert(free.registrationOpen === false, "registrationOpen false");

  const cancelled = toEventDetailsDto(
    baseEvent({
      status: EventLifecycleStatus.cancelled,
      registrationStatus: EventRegistrationStatus.open,
    registrationMode: EventRegistrationMode.internal,
    }),
  );
  assert(cancelled.registrationStatus === "closed", "cancelled → closed");
  assert(cancelled.registrationOpen === false, "cancelled not open");

  const completed = toEventDetailsDto(
    baseEvent({
      status: EventLifecycleStatus.completed,
      registrationStatus: EventRegistrationStatus.open,
    registrationMode: EventRegistrationMode.internal,
    }),
  );
  assert(completed.registrationStatus === "closed", "completed → closed");
  assert(completed.registrationOpen === false, "completed not open");

  console.log("events.mapper.details.test.ts: OK");
}

run();
