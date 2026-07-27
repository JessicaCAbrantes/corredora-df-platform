export type CurrentUser = {
  id: string;
  email: string;
};

export type GetCurrentUserResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; reason: "UNAUTHORIZED" | "NETWORK" | "UNKNOWN" };

export type HttpGetCurrentUserOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

type ApiMeBody = {
  data?: {
    id?: string;
    email?: string;
    passwordHash?: unknown;
    [key: string]: unknown;
  };
};

function getDefaultBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
  return raw.replace(/\/$/, "");
}

/**
 * HTTP Adapter — GET /api/v1/auth/me for Profile MVP.
 *
 * Maps only { id, email }. Never reads cookies via JS; never stores tokens.
 * Does not change getSession() gate contract.
 */
export function createHttpGetCurrentUser(
  options: HttpGetCurrentUserOptions = {},
): () => Promise<GetCurrentUserResult> {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function getCurrentUser(): Promise<GetCurrentUserResult> {
    const url = `${baseUrl}/api/v1/auth/me`;

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

      let body: ApiMeBody = {};
      try {
        body = (await response.json()) as ApiMeBody;
      } catch {
        return { ok: false, reason: "UNKNOWN" };
      }

      const id = body.data?.id;
      const email = body.data?.email;
      if (typeof id !== "string" || id.length === 0) {
        return { ok: false, reason: "UNKNOWN" };
      }
      if (typeof email !== "string" || email.length === 0) {
        return { ok: false, reason: "UNKNOWN" };
      }

      return { ok: true, user: { id, email } };
    } catch {
      return { ok: false, reason: "NETWORK" };
    }
  };
}

/** Default composition — Profile identity via /auth/me. */
export const getCurrentUser = createHttpGetCurrentUser();
