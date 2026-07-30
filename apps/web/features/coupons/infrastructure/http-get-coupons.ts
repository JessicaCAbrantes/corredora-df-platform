import type {
  CouponListItem,
  CouponsListPagination,
  GetCouponsListParams,
  GetCouponsListResult,
} from "../types/coupons-list";
import { env } from "@/lib/env";

type HttpCouponPartnerDto = {
  id: string;
  name: string;
  slug: string;
};

type HttpCouponDto = {
  id: string;
  title: string;
  discountLabel: string;
  expiresAt: string | null;
  active: boolean;
  partner: HttpCouponPartnerDto | null;
};

type HttpPaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type HttpCouponsListBody = {
  data?: unknown;
  meta?: unknown;
  error?: {
    code?: string;
    message?: string;
  };
};

export type HttpGetCoupons = (
  params: GetCouponsListParams,
) => Promise<GetCouponsListResult>;

export type HttpGetCouponsOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

const GENERIC_ERROR_MESSAGE = "Não foi possível carregar os cupons.";
const COUPONS_LIST_HREF = "/cupons";

export function buildCouponsListQuery(params: GetCouponsListParams): string {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("perPage", String(params.perPage));
  query.set("sort", params.sort);
  query.set("order", params.order);
  query.set("active", String(params.active));
  return query.toString();
}

function isPartnerDto(value: unknown): value is HttpCouponPartnerDto {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.slug === "string"
  );
}

function isHttpCouponDto(value: unknown): value is HttpCouponDto {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.discountLabel === "string" &&
    (row.expiresAt === null || typeof row.expiresAt === "string") &&
    typeof row.active === "boolean" &&
    (row.partner === null || isPartnerDto(row.partner)) &&
    !("code" in row)
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

function formatExpiresAtLabel(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toCouponListItem(dto: HttpCouponDto): CouponListItem {
  return {
    id: dto.id,
    title: dto.title,
    discountLabel: dto.discountLabel,
    partnerName: dto.partner?.name,
    expiresAtLabel: formatExpiresAtLabel(dto.expiresAt),
    href: COUPONS_LIST_HREF,
  };
}

function toPagination(meta: HttpPaginationMeta): CouponsListPagination {
  return {
    page: meta.page,
    perPage: meta.perPage,
    total: meta.total,
    totalPages: meta.totalPages,
  };
}

function errorResult(message?: string): GetCouponsListResult {
  return {
    status: "error",
    message: message || GENERIC_ERROR_MESSAGE,
  };
}

/**
 * HTTP Adapter — GET /api/v1/coupons (public teaser, no credentials, no code).
 */
export function createHttpGetCoupons(
  options: HttpGetCouponsOptions = {},
): HttpGetCoupons {
  const baseUrl = options.baseUrl ?? env.apiUrl;
  const fetchFn = options.fetchFn ?? fetch;

  return async function httpGetCoupons(
    params: GetCouponsListParams,
  ): Promise<GetCouponsListResult> {
    const url = `${baseUrl}/api/v1/coupons?${buildCouponsListQuery(params)}`;

    try {
      const response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      let body: HttpCouponsListBody = {};
      try {
        body = (await response.json()) as HttpCouponsListBody;
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

      if (!body.data.every(isHttpCouponDto)) {
        return errorResult();
      }

      return {
        status: "success",
        coupons: body.data.map(toCouponListItem),
        pagination: toPagination(body.meta),
      };
    } catch {
      return errorResult();
    }
  };
}
