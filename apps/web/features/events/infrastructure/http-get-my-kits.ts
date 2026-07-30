import { env } from "@/lib/env";

export type MyKitEvent = {
  id: string;
  slug: string;
  name: string;
  date: string;
  city: string;
  distance: string;
};

export type MyKitItem = {
  kitId: string;
  status: "available";
  event: MyKitEvent;
};

export type GetMyKitsResult =
  | { ok: true; data: MyKitItem[] }
  | { ok: false; reason: "UNAUTHORIZED" | "NETWORK" | "UNKNOWN" };

export type HttpGetMyKitsOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

type ApiMyKitsBody = {
  data?: unknown;
};

function mapItem(raw: unknown): MyKitItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const eventRaw = row.event;
  if (!eventRaw || typeof eventRaw !== "object") return null;
  const event = eventRaw as Record<string, unknown>;

  if (typeof row.kitId !== "string" || row.kitId.length === 0) return null;
  if (row.status !== "available") return null;
  if (typeof event.id !== "string" || event.id.length === 0) return null;
  if (typeof event.slug !== "string" || event.slug.length === 0) return null;
  if (typeof event.name !== "string" || event.name.length === 0) return null;
  if (typeof event.date !== "string" || event.date.length === 0) return null;
  if (typeof event.city !== "string") return null;
  if (typeof event.distance !== "string") return null;

  return {
    kitId: row.kitId,
    status: "available",
    event: {
      id: event.id,
      slug: event.slug,
      name: event.name,
      date: event.date,
      city: event.city,
      distance: event.distance,
    },
  };
}

/**
 * HTTP Adapter — GET /api/v1/events/me/kits.
 *
 * Identity is implicit via HttpOnly session cookie.
 * Does not accept userId. Never reads cookies via JS.
 */
export function createHttpGetMyKits(
  options: HttpGetMyKitsOptions = {},
): () => Promise<GetMyKitsResult> {
  const baseUrl = options.baseUrl ?? env.apiUrl;
  const fetchFn = options.fetchFn ?? fetch;

  return async function getMyKits(): Promise<GetMyKitsResult> {
    const url = `${baseUrl}/api/v1/events/me/kits`;

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

      let body: ApiMyKitsBody = {};
      try {
        body = (await response.json()) as ApiMyKitsBody;
      } catch {
        return { ok: false, reason: "UNKNOWN" };
      }

      if (!Array.isArray(body.data)) {
        return { ok: false, reason: "UNKNOWN" };
      }

      const data: MyKitItem[] = [];
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

/** Default composition — Kits / Retirada de Kits MVP. */
export const getMyKits = createHttpGetMyKits();
