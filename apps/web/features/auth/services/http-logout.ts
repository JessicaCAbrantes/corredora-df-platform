export type LogoutResult = { ok: true } | { ok: false };

export type HttpLogoutOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

function getDefaultBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
  return raw.replace(/\/$/, "");
}

/**
 * HTTP Adapter — POST /api/v1/auth/logout
 *
 * Relies on HttpOnly cookie via credentials: "include".
 * Never reads cookies via JS; never sends tokens or userId.
 *
 * Success: HTTP 204 (or other 2xx without body).
 */
export function createHttpLogout(
  options: HttpLogoutOptions = {},
): () => Promise<LogoutResult> {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function httpLogout(): Promise<LogoutResult> {
    const url = `${baseUrl}/api/v1/auth/logout`;

    try {
      const response = await fetchFn(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (response.status === 204 || response.ok) {
        return { ok: true };
      }

      return { ok: false };
    } catch {
      return { ok: false };
    }
  };
}

/** Default composition — real logout via /auth/logout. */
export const logout = createHttpLogout();
