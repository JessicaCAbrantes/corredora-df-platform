import type {
  GetKitPickupServicesListParams,
  GetKitPickupServicesListResult,
  KitPickupServiceListItem,
  KitPickupServicesListPagination,
} from "../types/kit-pickup-services-list";
import { env } from "@/lib/env";

type HttpEventDto = {
  id: string;
  name: string;
  slug: string;
};

type HttpKitPickupServiceDto = {
  id: string;
  title: string;
  event: HttpEventDto;
  statusLabel: string;
  pickupLabel: string | null;
  serviceAvailable: boolean;
  feeAmount: string | null;
  feeCurrency: string;
  registrationMode: "internal" | "external";
};

type HttpPaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type HttpKitPickupServicesListBody = {
  data?: unknown;
  meta?: unknown;
  error?: {
    code?: string;
    message?: string;
  };
};

export type HttpGetKitPickupServices = (
  params: GetKitPickupServicesListParams,
) => Promise<GetKitPickupServicesListResult>;

export type HttpGetKitPickupServicesOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

const GENERIC_ERROR_MESSAGE =
  "Não foi possível carregar os serviços de retirada.";
const KIT_PICKUP_LIST_HREF = "/kit-pickup";

export function buildKitPickupServicesListQuery(
  params: GetKitPickupServicesListParams,
): string {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("perPage", String(params.perPage));
  query.set("sort", params.sort);
  query.set("order", params.order);
  query.set("serviceAvailable", String(params.serviceAvailable));
  return query.toString();
}

function isEventDto(value: unknown): value is HttpEventDto {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.slug === "string"
  );
}

function isHttpKitPickupServiceDto(
  value: unknown,
): value is HttpKitPickupServiceDto {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    isEventDto(row.event) &&
    typeof row.statusLabel === "string" &&
    (row.pickupLabel === null || typeof row.pickupLabel === "string") &&
    typeof row.serviceAvailable === "boolean" &&
    (row.feeAmount === null || typeof row.feeAmount === "string") &&
    typeof row.feeCurrency === "string" &&
    (row.registrationMode === "internal" ||
      row.registrationMode === "external") &&
    !("userId" in row) &&
    !("participant" in row) &&
    !("email" in row) &&
    !("phone" in row) &&
    !("cpf" in row) &&
    !("paymentStatus" in row) &&
    !("term" in row) &&
    !("handover" in row)
  );
}

function isHttpPaginationMeta(value: unknown): value is HttpPaginationMeta {
  if (!value || typeof value !== "object") return false;
  const meta = value as Record<string, unknown>;
  return (
    typeof meta.page === "number" &&
    typeof meta.perPage === "number" &&
    typeof meta.total === "number" &&
    typeof meta.totalPages === "number"
  );
}

function toListItem(dto: HttpKitPickupServiceDto): KitPickupServiceListItem {
  return {
    id: dto.id,
    title: dto.title,
    eventName: dto.event.name,
    event: {
      id: dto.event.id,
      name: dto.event.name,
      slug: dto.event.slug,
    },
    statusLabel: dto.statusLabel,
    pickupLabel: dto.pickupLabel ?? undefined,
    href: KIT_PICKUP_LIST_HREF,
    feeAmount: dto.feeAmount,
    feeCurrency: dto.feeCurrency,
    registrationMode: dto.registrationMode,
    serviceAvailable: dto.serviceAvailable,
  };
}

function toPagination(meta: HttpPaginationMeta): KitPickupServicesListPagination {
  return {
    page: meta.page,
    perPage: meta.perPage,
    total: meta.total,
    totalPages: meta.totalPages,
  };
}

function errorResult(message?: string): GetKitPickupServicesListResult {
  return {
    status: "error",
    message: message || GENERIC_ERROR_MESSAGE,
  };
}

/**
 * HTTP Adapter — GET /api/v1/kit-pickup-services (public Phase 1 catalog).
 */
export function createHttpGetKitPickupServices(
  options: HttpGetKitPickupServicesOptions = {},
): HttpGetKitPickupServices {
  const baseUrl = options.baseUrl ?? env.apiUrl;
  const fetchFn = options.fetchFn ?? fetch;

  return async function httpGetKitPickupServices(
    params: GetKitPickupServicesListParams,
  ): Promise<GetKitPickupServicesListResult> {
    const url = `${baseUrl}/api/v1/kit-pickup-services?${buildKitPickupServicesListQuery(params)}`;

    try {
      const response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      let body: HttpKitPickupServicesListBody = {};
      try {
        body = (await response.json()) as HttpKitPickupServicesListBody;
      } catch {
        return errorResult();
      }

      if (!response.ok) {
        if (response.status >= 500) {
          return errorResult();
        }
        return errorResult(
          typeof body.error?.message === "string"
            ? body.error.message
            : undefined,
        );
      }

      if (!Array.isArray(body.data) || !isHttpPaginationMeta(body.meta)) {
        return errorResult();
      }

      if (!body.data.every(isHttpKitPickupServiceDto)) {
        return errorResult();
      }

      return {
        status: "success",
        services: body.data.map(toListItem),
        pagination: toPagination(body.meta),
      };
    } catch {
      return errorResult();
    }
  };
}
