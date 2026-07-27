import {
  EventCategory,
  EventLifecycleStatus,
  EventRegistrationStatus,
  type Event,
  type Prisma,
} from "@prisma/client";
import type {
  EventDetailsDto,
  EventDto,
  EventHttpCategory,
  EventHttpRegistrationStatus,
  EventsListMeta,
  MyKitItemDto,
  MyRegistrationItemDto,
} from "./events.types";
import type { ListEventsQueryDto } from "./dto/list-events-query.dto";

const MVP_KIT: EventDetailsDto["kit"] = {
  available: false,
  description: "Informações do kit em breve.",
};

const MVP_REGULATION: EventDetailsDto["regulation"] = {
  summary: "Participação sujeita ao regulamento oficial da prova.",
  href: "#regulamento",
  linkLabel: "Ver regulamento",
};

const CATEGORY_TO_PRISMA: Record<EventHttpCategory, EventCategory> = {
  marathon: EventCategory.marathon,
  "half-marathon": EventCategory.half_marathon,
  "5k": EventCategory.k5,
  "10k": EventCategory.k10,
  trail: EventCategory.trail,
};

const CATEGORY_TO_HTTP: Record<EventCategory, EventHttpCategory> = {
  [EventCategory.marathon]: "marathon",
  [EventCategory.half_marathon]: "half-marathon",
  [EventCategory.k5]: "5k",
  [EventCategory.k10]: "10k",
  [EventCategory.trail]: "trail",
};

export function toPrismaCategory(category: EventHttpCategory): EventCategory {
  return CATEGORY_TO_PRISMA[category];
}

export function buildEventsWhere(
  query: ListEventsQueryDto,
): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {};

  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  if (query.status) {
    where.status = query.status as EventLifecycleStatus;
  }

  if (query.category) {
    where.category = toPrismaCategory(query.category);
  }

  if (query.city) {
    where.city = { equals: query.city, mode: "insensitive" };
  }

  if (query.dateFrom || query.dateTo) {
    where.date = {};
    if (query.dateFrom) {
      where.date.gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
    }
    if (query.dateTo) {
      where.date.lte = new Date(`${query.dateTo}T23:59:59.999Z`);
    }
  }

  if (query.registrationOpen === true) {
    where.registrationStatus = EventRegistrationStatus.open;
  } else if (query.registrationOpen === false) {
    where.registrationStatus = { not: EventRegistrationStatus.open };
  }

  return where;
}

export function buildEventsOrderBy(
  query: ListEventsQueryDto,
): Prisma.EventOrderByWithRelationInput[] {
  const direction = query.order;
  const primary: Prisma.EventOrderByWithRelationInput =
    query.sort === "name"
      ? { name: direction }
      : query.sort === "createdAt"
        ? { createdAt: direction }
        : { date: direction };

  return [primary, { id: "asc" }];
}

export function buildMeta(
  page: number,
  perPage: number,
  total: number,
): EventsListMeta {
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

function resolveRegistrationStatus(
  status: EventLifecycleStatus,
  registrationStatus: EventRegistrationStatus,
): EventHttpRegistrationStatus {
  if (
    status === EventLifecycleStatus.cancelled ||
    status === EventLifecycleStatus.completed
  ) {
    return "closed";
  }
  return registrationStatus;
}

function toPrice(
  amount: Event["priceAmount"],
  currency: Event["priceCurrency"],
): EventDto["price"] {
  if (amount === null && currency === null) {
    return null;
  }
  if (amount === null || currency === null) {
    // Invariant broken in DB — treat as free rather than emit invalid DTO.
    return null;
  }
  return {
    amount: Number(amount),
    currency,
  };
}

export function toEventDto(event: Event): EventDto {
  const registrationStatus = resolveRegistrationStatus(
    event.status,
    event.registrationStatus,
  );

  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    date: event.date.toISOString(),
    city: event.city,
    category: CATEGORY_TO_HTTP[event.category],
    distance: event.distance,
    status: event.status,
    registrationStatus,
    registrationOpen: registrationStatus === "open",
    price: toPrice(event.priceAmount, event.priceCurrency),
    coverImage: event.coverImage,
  };
}

/**
 * Detail DTO for GET /events/by-slug/:slug.
 * Reuses list mapping for core fields; MVP A degrades rich sections.
 */
export function toEventDetailsDto(event: Event): EventDetailsDto {
  const base = toEventDto(event);

  return {
    id: base.id,
    slug: base.slug,
    name: base.name,
    date: base.date,
    city: base.city,
    distance: base.distance,
    status: base.status,
    registrationStatus: base.registrationStatus,
    registrationOpen: base.registrationOpen,
    price: base.price,
    coverImage: base.coverImage,
    kit: MVP_KIT,
    route: {
      available: false,
      summary: "Percurso ainda não divulgado.",
      distanceLabel: event.distance,
    },
    schedule: { items: [] },
    regulation: MVP_REGULATION,
  };
}

/**
 * Maps a registration row + joined Event for GET /events/me/registrations.
 */
export function toMyRegistrationItemDto(row: {
  id: string;
  createdAt: Date;
  event: Event;
}): MyRegistrationItemDto {
  const base = toEventDto(row.event);
  return {
    registrationId: row.id,
    registeredAt: row.createdAt.toISOString(),
    event: {
      id: base.id,
      slug: base.slug,
      name: base.name,
      date: base.date,
      city: base.city,
      distance: base.distance,
      status: base.status,
      registrationStatus: base.registrationStatus,
      coverImage: base.coverImage,
    },
  };
}

/**
 * Maps a registration + joined Event + Kit for GET /events/me/kits.
 * Distinct from EventDetailsDto.kit stub on the race detail page.
 */
export function toMyKitItemDto(row: {
  event: Event & { kit: { id: string } };
}): MyKitItemDto {
  return {
    kitId: row.event.kit.id,
    status: "available",
    event: {
      id: row.event.id,
      slug: row.event.slug,
      name: row.event.name,
      date: row.event.date.toISOString(),
      city: row.event.city,
      distance: row.event.distance,
    },
  };
}
