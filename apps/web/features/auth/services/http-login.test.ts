import { describe, expect, it, vi } from "vitest";
import { createHttpLogin, mapLoginError } from "./http-login";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("mapLoginError", () => {
  it("maps INVALID_CREDENTIALS and 401", () => {
    expect(mapLoginError({ status: 401, code: "INVALID_CREDENTIALS" })).toBe(
      "INVALID_CREDENTIALS",
    );
    expect(mapLoginError({ status: 401 })).toBe("INVALID_CREDENTIALS");
  });

  it("maps VALIDATION_ERROR and 400", () => {
    expect(mapLoginError({ status: 400, code: "VALIDATION_ERROR" })).toBe(
      "VALIDATION_ERROR",
    );
    expect(mapLoginError({ status: 400 })).toBe("VALIDATION_ERROR");
  });

  it("maps unknown", () => {
    expect(mapLoginError({ status: 500 })).toBe("UNKNOWN");
  });
});

describe("createHttpLogin", () => {
  it("POSTs credentials with include and returns user on 200", async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({
        data: { user: { id: "usr_01", email: "runner@corredora.df" } },
      }),
    );
    const login = createHttpLogin({
      baseUrl: "http://localhost:3001",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    const result = await login({
      email: "runner@corredora.df",
      password: "corredora123",
    });

    expect(result).toEqual({
      ok: true,
      user: { id: "usr_01", email: "runner@corredora.df" },
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/v1/auth/login");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(init?.body).toBe(
      JSON.stringify({
        email: "runner@corredora.df",
        password: "corredora123",
      }),
    );
  });

  it("maps 401 INVALID_CREDENTIALS", async () => {
    const login = createHttpLogin({
      baseUrl: "http://localhost:3001",
      fetchFn: async () =>
        jsonResponse(
          {
            status: "error",
            error: {
              code: "INVALID_CREDENTIALS",
              message: "E-mail ou senha incorretos.",
              status: 401,
            },
          },
          401,
        ),
    });

    await expect(
      login({ email: "runner@corredora.df", password: "wrong" }),
    ).resolves.toEqual({ ok: false, error: "INVALID_CREDENTIALS" });
  });

  it("maps 400 VALIDATION_ERROR", async () => {
    const login = createHttpLogin({
      baseUrl: "http://localhost:3001",
      fetchFn: async () =>
        jsonResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Dados inválidos.",
              status: 400,
            },
          },
          400,
        ),
    });

    await expect(
      login({ email: "bad", password: "" }),
    ).resolves.toEqual({ ok: false, error: "VALIDATION_ERROR" });
  });

  it("maps network errors", async () => {
    const login = createHttpLogin({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => {
        throw new TypeError("Failed to fetch");
      },
    });

    await expect(
      login({ email: "a@b.com", password: "x" }),
    ).resolves.toEqual({ ok: false, error: "NETWORK" });
  });
});
