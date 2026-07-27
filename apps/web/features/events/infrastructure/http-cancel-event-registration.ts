export type CancelEventRegistrationResult =
  | { ok: true }
  | { ok: false; reason: "UNAUTHORIZED" | "NOT_FOUND" | "NETWORK" | "UNKNOWN" };

export type HttpCancelEventRegistrationOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

function getDefaultBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
  return raw.replace(/\/$/, "");
}

/**
 * HTTP Adapter — DELETE /api/v1/events/:id/register.
 *
 * Identity is implicit via HttpOnly session cookie.
 * Does not accept userId. Never reads cookies via JS.
 * `:id` must be Event.id (never slug).
 */
export function createHttpCancelEventRegistration(
  options: HttpCancelEventRegistrationOptions = {},
): (eventId: string) => Promise<CancelEventRegistrationResult> {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function cancelEventRegistration(
    eventId: string,
  ): Promise<CancelEventRegistrationResult> {
    const url = `${baseUrl}/api/v1/events/${encodeURIComponent(eventId)}/register`;

    try {
      const response = await fetchFn(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (response.status === 204) {
        return { ok: true };
      }

      if (response.status === 401) {
        return { ok: false, reason: "UNAUTHORIZED" };
      }

      if (response.status === 404) {
        return { ok: false, reason: "NOT_FOUND" };
      }

      return { ok: false, reason: "UNKNOWN" };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

/** Default composition — Cancel Registration MVP. */
export const cancelEventRegistration = createHttpCancelEventRegistration();
