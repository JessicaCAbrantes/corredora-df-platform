import type {
  EventDetailsData,
  EventDetailsFetchResult,
  EventRegistrationStatus,
} from "../types/event-details";
import { env } from "@/lib/env";

/**
 * HTTP-local types — mirror of GET /api/v1/events/by-slug/:slug.
 * Never shared with Application; the DTO exists because HTTP ≠ Application.
 */
type HttpEventDetailsDto = {
  id: string;
  slug: string;
  name: string;
  date: string;
  city: string;
  distance: string;
  status: "active" | "cancelled" | "completed";
  registrationStatus: EventRegistrationStatus;
  registrationOpen: boolean;
  price: { amount: number; currency: string } | null;
  coverImage: string;
  kit: {
    available: boolean;
    description: string;
  };
  route: {
    available: boolean;
    summary: string;
    distanceLabel: string;
  };
  schedule: {
    items: Array<{
      id: string;
      label: string;
      timeLabel: string;
    }>;
  };
  regulation: {
    summary: string;
    href: string;
    linkLabel: string;
  };
};

type HttpEventDetailsBody = {
  data?: unknown;
  error?: {
    code?: string;
    message?: string;
    status?: number;
  };
};

export type HttpGetEventDetails = (
  slug: string,
) => Promise<EventDetailsFetchResult>;

export type HttpGetEventDetailsOptions = {
  /** Defaults to `env.apiUrl` (no trailing slash). */
  baseUrl?: string;
  /** Injected for tests — defaults to global `fetch`. */
  fetchFn?: typeof fetch;
};

const GENERIC_ERROR_MESSAGE =
  "Não foi possível carregar os dados desta corrida.";

const REGISTRATION_STATUSES = new Set<EventRegistrationStatus>([
  "open",
  "closed",
  "upcoming",
]);

const LIFECYCLE_STATUSES = new Set(["active", "cancelled", "completed"]);

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/$/, "");
}

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const TIME_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** UTC-only: avoids local timezone day/hour rollover. */
function formatDateAndTime(iso: string): {
  dateLabel: string;
  timeLabel: string;
} {
  const date = new Date(iso);
  return {
    dateLabel: DATE_LABEL_FORMATTER.format(date),
    timeLabel: TIME_LABEL_FORMATTER.format(date),
  };
}

/**
 * `null` → free label; `{ amount: 0 }` preserves "R$ 0,00".
 * Never invents originalPriceLabel / discountLabel.
 */
function formatCurrentPrice(
  price: HttpEventDetailsDto["price"],
): string {
  if (price === null) {
    return "Gratuito";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: price.currency,
  }).format(price.amount);
}

function isScheduleItem(
  item: unknown,
): item is HttpEventDetailsDto["schedule"]["items"][number] {
  if (typeof item !== "object" || item === null) {
    return false;
  }
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    typeof candidate.timeLabel === "string"
  );
}

function isValidEventDetailsDto(data: unknown): data is HttpEventDetailsDto {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const d = data as Record<string, unknown>;

  if (
    typeof d.id !== "string" ||
    typeof d.slug !== "string" ||
    typeof d.name !== "string" ||
    typeof d.date !== "string" ||
    typeof d.city !== "string" ||
    typeof d.distance !== "string" ||
    typeof d.coverImage !== "string" ||
    typeof d.registrationOpen !== "boolean"
  ) {
    return false;
  }

  if (
    typeof d.status !== "string" ||
    !LIFECYCLE_STATUSES.has(d.status) ||
    typeof d.registrationStatus !== "string" ||
    !REGISTRATION_STATUSES.has(d.registrationStatus as EventRegistrationStatus)
  ) {
    return false;
  }

  if (d.price !== null) {
    if (typeof d.price !== "object" || d.price === null) {
      return false;
    }
    const price = d.price as Record<string, unknown>;
    if (typeof price.amount !== "number" || typeof price.currency !== "string") {
      return false;
    }
  }

  if (typeof d.kit !== "object" || d.kit === null) {
    return false;
  }
  const kit = d.kit as Record<string, unknown>;
  if (typeof kit.available !== "boolean" || typeof kit.description !== "string") {
    return false;
  }

  if (typeof d.route !== "object" || d.route === null) {
    return false;
  }
  const route = d.route as Record<string, unknown>;
  if (
    typeof route.available !== "boolean" ||
    typeof route.summary !== "string" ||
    typeof route.distanceLabel !== "string"
  ) {
    return false;
  }

  if (typeof d.schedule !== "object" || d.schedule === null) {
    return false;
  }
  const schedule = d.schedule as Record<string, unknown>;
  if (!Array.isArray(schedule.items) || !schedule.items.every(isScheduleItem)) {
    return false;
  }

  if (typeof d.regulation !== "object" || d.regulation === null) {
    return false;
  }
  const regulation = d.regulation as Record<string, unknown>;
  if (
    typeof regulation.summary !== "string" ||
    typeof regulation.href !== "string" ||
    typeof regulation.linkLabel !== "string"
  ) {
    return false;
  }

  return true;
}

function toEventDetailsData(dto: HttpEventDetailsDto): EventDetailsData {
  const { dateLabel, timeLabel } = formatDateAndTime(dto.date);

  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    dateLabel,
    timeLabel,
    distanceLabel: dto.distance,
    locationLabel: dto.city,
    imageAlt: dto.name,
    ...(dto.coverImage ? { imageSrc: dto.coverImage } : {}),
    registrationStatus: dto.registrationStatus,
    pricing: {
      currentPriceLabel: formatCurrentPrice(dto.price),
    },
    kit: {
      available: dto.kit.available,
      description: dto.kit.description,
    },
    route: {
      available: dto.route.available,
      summary: dto.route.summary,
      distanceLabel: dto.route.distanceLabel,
    },
    schedule: {
      items: dto.schedule.items.map((item) => ({
        id: item.id,
        label: item.label,
        timeLabel: item.timeLabel,
      })),
    },
    regulation: {
      summary: dto.regulation.summary,
      href: dto.regulation.href,
      linkLabel: dto.regulation.linkLabel,
    },
  };
}

function errorResult(message?: string): EventDetailsFetchResult {
  return {
    status: "error",
    message: message || GENERIC_ERROR_MESSAGE,
  };
}

/**
 * HTTP Adapter for event details.
 * Speaks the external world (`GET /api/v1/events/by-slug/:slug`);
 * returns only Application language (`EventDetailsFetchResult`).
 * Runs in Server Components; never throws to the consumer.
 */
export function createHttpGetEventDetails(
  options: HttpGetEventDetailsOptions = {},
): HttpGetEventDetails {
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? env.apiUrl);
  const fetchFn = options.fetchFn ?? fetch;

  return async function httpGetEventDetails(
    slug: string,
  ): Promise<EventDetailsFetchResult> {
    const url = `${baseUrl}/api/v1/events/by-slug/${encodeURIComponent(slug)}`;

    try {
      const response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      let body: HttpEventDetailsBody = {};
      try {
        body = (await response.json()) as HttpEventDetailsBody;
      } catch {
        return errorResult();
      }

      if (
        response.status === 404 ||
        body.error?.code === "EVENT_NOT_FOUND"
      ) {
        return { status: "not_found" };
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

      if (!isValidEventDetailsDto(body.data)) {
        return errorResult();
      }

      return {
        status: "success",
        event: toEventDetailsData(body.data),
      };
    } catch {
      return errorResult();
    }
  };
}
