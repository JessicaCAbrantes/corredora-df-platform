import type {
  Event,
  EventRegistrationMode,
  KitPickupService,
  Prisma,
} from "@prisma/client";
import type { ListKitPickupServicesQueryDto } from "./dto/list-kit-pickup-services-query.dto";
import type {
  KitPickupServiceDto,
  KitPickupServicesListMeta,
} from "./kit-pickup-services.types";

export type KitPickupServiceWithEvent = KitPickupService & {
  event: Event;
};

function formatFeeAmount(amount: KitPickupService["feeAmount"]): string | null {
  if (amount === null) return null;
  return Number(amount).toFixed(2);
}

function formatDayMonth(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

export function buildPickupLabel(row: KitPickupService): string | null {
  const location = row.pickupLocation?.trim() || null;
  if (!row.pickupStartAt && !row.pickupEndAt && !location) {
    return null;
  }

  let windowLabel: string | null = null;
  if (row.pickupStartAt && row.pickupEndAt) {
    windowLabel = `${formatDayMonth(row.pickupStartAt)}–${formatDayMonth(row.pickupEndAt)}`;
  } else if (row.pickupStartAt) {
    windowLabel = `a partir de ${formatDayMonth(row.pickupStartAt)}`;
  } else if (row.pickupEndAt) {
    windowLabel = `até ${formatDayMonth(row.pickupEndAt)}`;
  }

  if (location && windowLabel) {
    return `${location} · ${windowLabel}`;
  }
  return location ?? windowLabel;
}

export function buildStatusLabel(
  row: KitPickupService,
  now: Date = new Date(),
): string {
  if (!row.serviceAvailable) {
    return "Indisponível";
  }
  if (row.pickupEndAt && row.pickupEndAt.getTime() < now.getTime()) {
    return "Prazo encerrado";
  }
  if (row.pickupStartAt && row.pickupStartAt.getTime() > now.getTime()) {
    return "Retirada em breve";
  }
  if (
    row.pickupStartAt &&
    row.pickupEndAt &&
    row.pickupStartAt.getTime() <= now.getTime() &&
    row.pickupEndAt.getTime() >= now.getTime()
  ) {
    return "Retirada aberta";
  }
  return "Retirada disponível";
}

function toRegistrationModeHttp(
  mode: EventRegistrationMode,
): "internal" | "external" {
  return mode === "external" ? "external" : "internal";
}

export function toKitPickupServiceDto(
  row: KitPickupServiceWithEvent,
  now: Date = new Date(),
): KitPickupServiceDto {
  return {
    id: row.id,
    title: row.title,
    event: {
      id: row.event.id,
      name: row.event.name,
      slug: row.event.slug,
    },
    statusLabel: buildStatusLabel(row, now),
    pickupLabel: buildPickupLabel(row),
    serviceAvailable: row.serviceAvailable,
    feeAmount: formatFeeAmount(row.feeAmount),
    feeCurrency: row.feeCurrency,
    registrationMode: toRegistrationModeHttp(row.event.registrationMode),
  };
}

export function buildKitPickupServicesWhere(
  query: ListKitPickupServicesQueryDto,
): Prisma.KitPickupServiceWhereInput {
  return {
    serviceAvailable: query.serviceAvailable,
  };
}

export function buildKitPickupServicesOrderBy(
  query: ListKitPickupServicesQueryDto,
): Prisma.KitPickupServiceOrderByWithRelationInput[] {
  const direction = query.order;
  const primary: Prisma.KitPickupServiceOrderByWithRelationInput =
    query.sort === "title"
      ? { title: direction }
      : query.sort === "createdAt"
        ? { createdAt: direction }
        : { pickupStartAt: direction };

  return [primary, { id: "asc" }];
}

export function buildKitPickupServicesMeta(
  page: number,
  perPage: number,
  total: number,
): KitPickupServicesListMeta {
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
