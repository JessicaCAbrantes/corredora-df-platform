import type {
  GetPartnersListParams,
  GetPartnersListResult,
  PartnerListItem,
  PartnersListPagination,
} from "../types/partners-list";
import { env } from "@/lib/env";

type HttpPartnerDto = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  logo: string | null;
  website: string | null;
  active: boolean;
};

type HttpPaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type HttpPartnersListBody = {
  data?: unknown;
  meta?: unknown;
  error?: {
    code?: string;
    message?: string;
    status?: number;
  };
};

export type HttpGetPartners = (
  params: GetPartnersListParams,
) => Promise<GetPartnersListResult>;

export type HttpGetPartnersOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

const GENERIC_ERROR_MESSAGE = "Não foi possível carregar os parceiros.";
const PARTNERS_DETAIL_BASE_HREF = "/parceiros";

export function buildPartnersListQuery(params: GetPartnersListParams): string {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("perPage", String(params.perPage));
  query.set("sort", params.sort);
  query.set("order", params.order);
  query.set("active", String(params.active));
  return query.toString();
}

function isHttpPartnerDto(value: unknown): value is HttpPartnerDto {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.slug === "string" &&
    (row.category === null || typeof row.category === "string") &&
    (row.logo === null || typeof row.logo === "string") &&
    (row.website === null || typeof row.website === "string") &&
    typeof row.active === "boolean"
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

function toPartnerListItem(dto: HttpPartnerDto): PartnerListItem {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    category: dto.category ?? undefined,
    href: `${PARTNERS_DETAIL_BASE_HREF}/${dto.slug}`,
  };
}

function toPagination(meta: HttpPaginationMeta): PartnersListPagination {
  return {
    page: meta.page,
    perPage: meta.perPage,
    total: meta.total,
    totalPages: meta.totalPages,
  };
}

function errorResult(message?: string): GetPartnersListResult {
  return {
    status: "error",
    message: message || GENERIC_ERROR_MESSAGE,
  };
}

/**
 * HTTP Adapter — GET /api/v1/partners (public, no credentials).
 */
export function createHttpGetPartners(
  options: HttpGetPartnersOptions = {},
): HttpGetPartners {
  const baseUrl = options.baseUrl ?? env.apiUrl;
  const fetchFn = options.fetchFn ?? fetch;

  return async function httpGetPartners(
    params: GetPartnersListParams,
  ): Promise<GetPartnersListResult> {
    const url = `${baseUrl}/api/v1/partners?${buildPartnersListQuery(params)}`;

    try {
      const response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      let body: HttpPartnersListBody = {};
      try {
        body = (await response.json()) as HttpPartnersListBody;
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

      if (!body.data.every(isHttpPartnerDto)) {
        return errorResult();
      }

      return {
        status: "success",
        partners: body.data.map(toPartnerListItem),
        pagination: toPagination(body.meta),
      };
    } catch {
      return errorResult();
    }
  };
}

export const getPartnersListHttp = createHttpGetPartners();
