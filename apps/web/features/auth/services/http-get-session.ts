import { env } from "@/lib/env";

export type Session = { userId: string };

export type GetSession = () => Promise<Session | null>;

export type HttpGetSessionOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

type ApiMeBody = {
  data?: {
    id?: string;
    email?: string;
  };
};

/**
 * HTTP Adapter — GET /api/v1/auth/me
 *
 * 200 → { userId: data.id }
 * 401 → null
 * network / unexpected → null (fail closed for auth gate)
 *
 * Never reads cookies via JS; browser sends HttpOnly cookie with credentials.
 */
export function createHttpGetSession(
  options: HttpGetSessionOptions = {},
): GetSession {
  const baseUrl = options.baseUrl ?? env.apiUrl;
  const fetchFn = options.fetchFn ?? fetch;

  return async function getSession(): Promise<Session | null> {
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
        return null;
      }

      if (!response.ok) {
        return null;
      }

      let body: ApiMeBody = {};
      try {
        body = (await response.json()) as ApiMeBody;
      } catch {
        return null;
      }

      const id = body.data?.id;
      if (typeof id !== "string" || id.length === 0) {
        return null;
      }

      return { userId: id };
    } catch {
      return null;
    }
  };
}

/** Default composition — real session via /auth/me. */
export const getSession: GetSession = createHttpGetSession();
