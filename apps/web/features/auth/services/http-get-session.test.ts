import { describe, expect, it, vi } from "vitest";
import { createHttpGetSession } from "./http-get-session";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createHttpGetSession", () => {
  it("returns { userId } on 200", async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({ data: { id: "usr_01", email: "runner@corredora.df" } }),
    );
    const getSession = createHttpGetSession({
      baseUrl: "http://localhost:3001",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await expect(getSession()).resolves.toEqual({ userId: "usr_01" });
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/v1/auth/me");
    expect(init?.method).toBe("GET");
    expect(init?.credentials).toBe("include");
  });

  it("returns null on 401", async () => {
    const getSession = createHttpGetSession({
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

    await expect(getSession()).resolves.toBeNull();
  });

  it("returns null on network error", async () => {
    const getSession = createHttpGetSession({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => {
        throw new TypeError("Failed to fetch");
      },
    });

    await expect(getSession()).resolves.toBeNull();
  });

  it("returns null when body shape is invalid", async () => {
    const getSession = createHttpGetSession({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => jsonResponse({ data: {} }),
    });

    await expect(getSession()).resolves.toBeNull();
  });
});
