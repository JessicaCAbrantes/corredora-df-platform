import { env } from "@/lib/env";

export type MyRegistrationEvent = {
  id: string;
  slug: string;
  name: string;
  date: string;
  city: string;
  distance: string;
  status: "active" | "cancelled" | "completed";
  registrationStatus: "open" | "closed" | "upcoming";
  coverImage: string;
};

export type MyRegistrationItem = {
  registrationId: string;
  registeredAt: string;
  event: MyRegistrationEvent;
};

export type GetMyRegistrationsResult =
  | { ok: true; data: MyRegistrationItem[] }
  | { ok: false; reason: "UNAUTHORIZED" | "NETWORK" | "UNKNOWN" };

export type HttpGetMyRegistrationsOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

type ApiMyRegistrationsBody = {
  data?: unknown;
};

function isLifecycleStatus(
  value: unknown,
): value is MyRegistrationEvent["status"] {
  return value === "active" || value === "cancelled" || value === "completed";
}

function isRegistrationStatus(
  value: unknown,
): value is MyRegistrationEvent["registrationStatus"] {
  return value === "open" || value === "closed" || value === "upcoming";
}

function mapItem(raw: unknown): MyRegistrationItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const eventRaw = row.event;
  if (!eventRaw || typeof eventRaw !== "object") return null;
  const event = eventRaw as Record<string, unknown>;

  if (typeof row.registrationId !== "string" || row.registrationId.length === 0) {
    return null;
  }
  if (typeof row.registeredAt !== "string" || row.registeredAt.length === 0) {
    return null;
  }
  if (typeof event.id !== "string" || event.id.length === 0) return null;
  if (typeof event.slug !== "string" || event.slug.length === 0) return null;
  if (typeof event.name !== "string" || event.name.length === 0) return null;
  if (typeof event.date !== "string" || event.date.length === 0) return null;
  if (typeof event.city !== "string") return null;
  if (typeof event.distance !== "string") return null;
  if (!isLifecycleStatus(event.status)) return null;
  if (!isRegistrationStatus(event.registrationStatus)) return null;
  if (typeof event.coverImage !== "string") return null;

  return {
    registrationId: row.registrationId,
    registeredAt: row.registeredAt,
    event: {
      id: event.id,
      slug: event.slug,
      name: event.name,
      date: event.date,
      city: event.city,
      distance: event.distance,
      status: event.status,
      registrationStatus: event.registrationStatus,
      coverImage: event.coverImage,
    },
  };
}

/**
 * HTTP Adapter — GET /api/v1/events/me/registrations.
 *
 * Identity is implicit via HttpOnly session cookie.
 * Does not accept userId. Never reads cookies via JS.
 */
export function createHttpGetMyRegistrations(
  options: HttpGetMyRegistrationsOptions = {},
): () => Promise<GetMyRegistrationsResult> {
  const baseUrl = options.baseUrl ?? env.apiUrl;
  const fetchFn = options.fetchFn ?? fetch;

  return async function getMyRegistrations(): Promise<GetMyRegistrationsResult> {
    const url = `${baseUrl}/api/v1/events/me/registrations`;

    try {
      const response = await fetchFn(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (response.status === 401) {
        return { ok: false, reason: "UNAUTHORIZED" };
      }

      if (!response.ok) {
        return { ok: false, reason: "UNKNOWN" };
      }

      let body: ApiMyRegistrationsBody = {};
      try {
        body = (await response.json()) as ApiMyRegistrationsBody;
      } catch {
        return { ok: false, reason: "UNKNOWN" };
      }

      if (!Array.isArray(body.data)) {
        return { ok: false, reason: "UNKNOWN" };
      }

      const data: MyRegistrationItem[] = [];
      for (const item of body.data) {
        const mapped = mapItem(item);
        if (!mapped) {
          return { ok: false, reason: "UNKNOWN" };
        }
        data.push(mapped);
      }

      return { ok: true, data };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

/** Default composition — My Registrations MVP. */
export const getMyRegistrations = createHttpGetMyRegistrations();
