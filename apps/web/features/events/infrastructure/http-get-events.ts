import type {
  EventListItem,
  EventListStatus,
  EventsListPagination,
  GetEventsListParams,
  GetEventsListResult,
} from "../types/events-list";
import { sanitizeCoverImageSrc } from "../utils/sanitize-cover-image";
import { env } from "@/lib/env";

/**
 * HTTP-local types — mirror of the documented GET /api/v1/events contract.
 * Never shared with Application; the DTO exists because HTTP ≠ Application.
 */
type HttpEventDto = {
  id: string;
  name: string;
  slug: string;
  date: string;
  city: string;
  category: string;
  distance: string;
  status: "active" | "cancelled" | "completed";
  registrationStatus: "open" | "closed" | "upcoming";
  registrationOpen: boolean;
  price: { amount: number; currency: string } | null;
  coverImage: string;
};

type HttpPaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type HttpEventsListBody = {
  data?: unknown;
  meta?: unknown;
  error?: {
    code?: string;
    message?: string;
    status?: number;
  };
};

export type HttpGetEvents = (
  params: GetEventsListParams,
) => Promise<GetEventsListResult>;

export type HttpGetEventsOptions = {
  /** Defaults to `env.apiUrl` (no trailing slash). */
  baseUrl?: string;
  /** Injected for tests — defaults to global `fetch`. */
  fetchFn?: typeof fetch;
};

const GENERIC_ERROR_MESSAGE = "Não foi possível carregar as corridas.";

/**
 * Serializes normalized Application params into the HTTP query.
 * Required params are always sent; optionals only when defined.
 */
export function buildEventsListQuery(params: GetEventsListParams): string {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("perPage", String(params.perPage));
  query.set("sort", params.sort);
  query.set("order", params.order);

  if (params.search !== undefined && params.search !== "") {
    query.set("search", params.search);
  }
  if (params.status !== undefined) {
    query.set("status", params.status);
  }
  if (params.category !== undefined) {
    query.set("category", params.category);
  }
  if (params.city !== undefined && params.city !== "") {
    query.set("city", params.city);
  }
  if (params.dateFrom !== undefined) {
    query.set("dateFrom", params.dateFrom);
  }
  if (params.dateTo !== undefined) {
    query.set("dateTo", params.dateTo);
  }
  if (params.registrationOpen !== undefined) {
    query.set("registrationOpen", String(params.registrationOpen));
  }

  return query.toString();
}

/**
 * Approved reduction: lifecycle + registrationStatus → presentational status.
 * cancelled/completed always close the card regardless of registrationStatus.
 */
export function mapEventStatus(
  lifecycle: HttpEventDto["status"],
  registrationStatus: HttpEventDto["registrationStatus"],
): EventListStatus {
  if (lifecycle === "cancelled" || lifecycle === "completed") {
    return "closed";
  }
  return registrationStatus;
}

/** `null` = explicitly free (omit); `{ amount: 0 }` is a paid-zero label. */
function formatPrice(price: HttpEventDto["price"]): string | undefined {
  if (price === null) {
    return undefined;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: price.currency,
  }).format(price.amount);
}

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** UTC-only: `2026-08-01T01:00:00.000Z` stays day 01, never the local day before. */
function formatDates(iso: string): { date: string; dateTime: string } {
  return {
    dateTime: iso.slice(0, 10),
    date: DATE_LABEL_FORMATTER.format(new Date(iso)),
  };
}

function toEventListItem(dto: HttpEventDto): EventListItem {
  const { date, dateTime } = formatDates(dto.date);
  const price = formatPrice(dto.price);
  const coverSrc = sanitizeCoverImageSrc(dto.coverImage);

  return {
    slug: dto.slug,
    title: dto.name,
    date,
    dateTime,
    city: dto.city,
    distance: dto.distance,
    ...(price !== undefined ? { price } : {}),
    status: mapEventStatus(dto.status, dto.registrationStatus),
    image: {
      ...(coverSrc ? { src: coverSrc } : {}),
      alt: dto.name,
    },
  };
}

/** Drops hasNextPage/hasPreviousPage — UI derives them from page/totalPages. */
function toPagination(meta: HttpPaginationMeta): EventsListPagination {
  return {
    page: meta.page,
    perPage: meta.perPage,
    total: meta.total,
    totalPages: meta.totalPages,
  };
}

function isValidMeta(meta: unknown): meta is HttpPaginationMeta {
  if (typeof meta !== "object" || meta === null) {
    return false;
  }
  const candidate = meta as Record<string, unknown>;
  return (
    typeof candidate.page === "number" &&
    typeof candidate.perPage === "number" &&
    typeof candidate.total === "number" &&
    typeof candidate.totalPages === "number"
  );
}

function errorResult(message?: string): GetEventsListResult {
  return {
    status: "error",
    message: message || GENERIC_ERROR_MESSAGE,
  };
}

/**
 * HTTP Adapter for the events listing.
 * Speaks the external world (`GET /api/v1/events`);
 * returns only Application language (`GetEventsListResult`).
 * Runs in Server Components; never throws to the consumer.
 */
export function createHttpGetEvents(
  options: HttpGetEventsOptions = {},
): HttpGetEvents {
  const baseUrl = options.baseUrl ?? env.apiUrl;
  const fetchFn = options.fetchFn ?? fetch;

  return async function httpGetEvents(
    params: GetEventsListParams,
  ): Promise<GetEventsListResult> {
    const url = `${baseUrl}/api/v1/events?${buildEventsListQuery(params)}`;

    try {
      const response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        // Listing is query-driven and dynamic — never serve a stale page.
        cache: "no-store",
      });

      let body: HttpEventsListBody = {};
      try {
        body = (await response.json()) as HttpEventsListBody;
      } catch {
        return errorResult();
      }

      if (!response.ok) {
        return errorResult(
          typeof body.error?.message === "string"
            ? body.error.message
            : undefined,
        );
      }

      if (!Array.isArray(body.data) || !isValidMeta(body.meta)) {
        return errorResult();
      }

      return {
        status: "success",
        events: (body.data as HttpEventDto[]).map(toEventListItem),
        pagination: toPagination(body.meta),
      };
    } catch {
      return errorResult();
    }
  };
}
