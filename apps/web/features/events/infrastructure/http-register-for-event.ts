import type {
  RegisterForEvent,
  RegisterForEventError,
  RegisterForEventInput,
  RegisterForEventResult,
} from "../application/register-for-event";
import { env } from "@/lib/env";

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    status?: number;
  };
};

type ApiSuccessBody = {
  data?:
    | null
    | {
        id?: string;
        registrationId?: string;
      };
  message?: string;
};

export type HttpRegisterForEventOptions = {
  /** Defaults to `env.apiUrl` (no trailing slash). */
  baseUrl?: string;
  /** Injected for tests — defaults to global `fetch`. */
  fetchFn?: typeof fetch;
};

/**
 * Maps external API error language → Application `RegisterForEventError`.
 * Infrastructure only — Handler/Domain never see HTTP codes.
 */
export function mapHttpRegisterError(params: {
  status: number;
  code?: string;
}): RegisterForEventError {
  const code = params.code;

  if (code === "ALREADY_REGISTERED") return "ALREADY_REGISTERED";
  if (code === "EVENT_FULL") return "EVENT_FULL";
  if (code === "EVENT_NOT_FOUND") return "EVENT_NOT_FOUND";
  if (code === "EVENT_INACTIVE") return "EVENT_INACTIVE";
  // API docs use EVENT_REGISTRATION_CLOSED; Application speaks REGISTRATION_CLOSED.
  if (code === "EVENT_REGISTRATION_CLOSED") return "REGISTRATION_CLOSED";
  if (code === "UNAUTHORIZED" || code === "TOKEN_EXPIRED") {
    return "UNAUTHENTICATED";
  }

  if (params.status === 401) return "UNAUTHENTICATED";
  if (params.status === 404) return "EVENT_NOT_FOUND";
  if (params.status === 409) return "ALREADY_REGISTERED";

  return "UNKNOWN";
}

function resolveRegistrationId(body: ApiSuccessBody): string {
  if (body.data && typeof body.data === "object") {
    if (typeof body.data.registrationId === "string") {
      return body.data.registrationId;
    }
    if (typeof body.data.id === "string") {
      return body.data.id;
    }
  }
  // API may return `{ data: null, message }` for successful actions.
  return "reg_confirmed";
}

/**
 * HTTP Adapter for `RegisterForEvent`.
 * Speaks the external world (`POST /api/v1/events/:id/register`);
 * returns only Application language (`RegisterForEventResult`).
 */
export function createHttpRegisterForEvent(
  options: HttpRegisterForEventOptions = {},
): RegisterForEvent {
  const baseUrl = options.baseUrl ?? env.apiUrl;
  const fetchFn = options.fetchFn ?? fetch;

  return async function httpRegisterForEvent(
    input: RegisterForEventInput,
  ): Promise<RegisterForEventResult> {
    const url = `${baseUrl}/api/v1/events/${encodeURIComponent(input.eventId)}/register`;

    try {
      const response = await fetchFn(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        // userId comes from Auth Boundary; API authenticates via session/cookie.
        body: JSON.stringify({}),
      });

      let body: ApiErrorBody & ApiSuccessBody = {};
      try {
        body = (await response.json()) as ApiErrorBody & ApiSuccessBody;
      } catch {
        body = {};
      }

      if (!response.ok) {
        return {
          ok: false,
          error: mapHttpRegisterError({
            status: response.status,
            code: body.error?.code,
          }),
        };
      }

      return {
        ok: true,
        registrationId: resolveRegistrationId(body),
      };
    } catch {
      return { ok: false, error: "UNKNOWN" };
    }
  };
}
