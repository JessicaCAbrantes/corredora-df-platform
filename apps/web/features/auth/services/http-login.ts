export type LoginInput = {
  email: string;
  password: string;
};

export type LoginError =
  | "INVALID_CREDENTIALS"
  | "VALIDATION_ERROR"
  | "NETWORK"
  | "UNKNOWN";

export type LoginResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; error: LoginError };

export type HttpLoginOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    status?: number;
  };
};

type ApiSuccessBody = {
  data?: {
    user?: {
      id?: string;
      email?: string;
    };
  };
};

function getDefaultBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
  return raw.replace(/\/$/, "");
}

export function mapLoginError(params: {
  status: number;
  code?: string;
}): LoginError {
  if (params.code === "INVALID_CREDENTIALS" || params.status === 401) {
    return "INVALID_CREDENTIALS";
  }
  if (params.code === "VALIDATION_ERROR" || params.status === 400) {
    return "VALIDATION_ERROR";
  }
  return "UNKNOWN";
}

/**
 * HTTP Adapter — POST /api/v1/auth/login
 * Relies on browser Set-Cookie (HttpOnly). Never stores tokens.
 */
export function createHttpLogin(
  options: HttpLoginOptions = {},
): (input: LoginInput) => Promise<LoginResult> {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();
  const fetchFn = options.fetchFn ?? fetch;

  return async function httpLogin(input: LoginInput): Promise<LoginResult> {
    const url = `${baseUrl}/api/v1/auth/login`;

    try {
      const response = await fetchFn(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: input.email,
          password: input.password,
        }),
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
          error: mapLoginError({
            status: response.status,
            code: body.error?.code,
          }),
        };
      }

      const id = body.data?.user?.id;
      const email = body.data?.user?.email;
      if (typeof id !== "string" || typeof email !== "string") {
        return { ok: false, error: "UNKNOWN" };
      }

      return { ok: true, user: { id, email } };
    } catch {
      return { ok: false, error: "NETWORK" };
    }
  };
}
