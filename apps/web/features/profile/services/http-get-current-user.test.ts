import { describe, expect, it, vi } from "vitest";
import { createHttpGetCurrentUser } from "./http-get-current-user";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createHttpGetCurrentUser", () => {
  it("returns { id, email } on 200 with credentials include", async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({
        data: {
          id: "usr_01",
          email: "runner@corredora.df",
          passwordHash: "should-never-leak",
        },
      }),
    );
    const getCurrentUser = createHttpGetCurrentUser({
      baseUrl: "http://localhost:3001",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await expect(getCurrentUser()).resolves.toEqual({
      ok: true,
      user: { id: "usr_01", email: "runner@corredora.df" },
    });

    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/v1/auth/me");
    expect(init?.method).toBe("GET");
    expect(init?.credentials).toBe("include");
    expect(init?.headers).toEqual({ Accept: "application/json" });
    expect(init?.body).toBeUndefined();
    expect(
      JSON.stringify(init?.headers ?? {}).toLowerCase().includes("authorization"),
    ).toBe(false);
  });

  it("returns UNAUTHORIZED on 401", async () => {
    const getCurrentUser = createHttpGetCurrentUser({
      baseUrl: "http://localhost:3001",
      fetchFn: async () =>
        jsonResponse(
          {
            status: "error",
            error: { code: "UNAUTHORIZED", status: 401 },
          },
          401,
        ),
    });

    await expect(getCurrentUser()).resolves.toEqual({
      ok: false,
      reason: "UNAUTHORIZED",
    });
  });

  it("returns NETWORK on fetch failure", async () => {
    const getCurrentUser = createHttpGetCurrentUser({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => {
        throw new TypeError("Failed to fetch");
      },
    });

    await expect(getCurrentUser()).resolves.toEqual({
      ok: false,
      reason: "NETWORK",
    });
  });

  it("returns UNKNOWN on invalid body shape", async () => {
    const getCurrentUser = createHttpGetCurrentUser({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => jsonResponse({ data: { id: "usr_01" } }),
    });

    await expect(getCurrentUser()).resolves.toEqual({
      ok: false,
      reason: "UNKNOWN",
    });
  });

  it("never exposes passwordHash in the mapped user", async () => {
    const getCurrentUser = createHttpGetCurrentUser({
      baseUrl: "http://localhost:3001",
      fetchFn: async () =>
        jsonResponse({
          data: {
            id: "usr_01",
            email: "runner@corredora.df",
            passwordHash: "scrypt$...",
          },
        }),
    });

    const result = await getCurrentUser();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user).toEqual({
        id: "usr_01",
        email: "runner@corredora.df",
      });
      expect(result.user).not.toHaveProperty("passwordHash");
    }
  });
});
