import { describe, expect, it, vi } from "vitest";
import { createHttpGetMyKits } from "./http-get-my-kits";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const sampleItem = {
  kitId: "kit_01_meia",
  status: "available" as const,
  event: {
    id: "evt_01_meia",
    slug: "meia-maratona-brasilia",
    name: "Meia Maratona de Brasília",
    date: "2026-08-16T10:00:00.000Z",
    city: "Brasília",
    distance: "21K",
  },
};

describe("createHttpGetMyKits", () => {
  it("returns list on 200 with credentials include and no body", async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ data: [sampleItem] }));
    const getMyKits = createHttpGetMyKits({
      baseUrl: "http://localhost:3001",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await expect(getMyKits()).resolves.toEqual({
      ok: true,
      data: [sampleItem],
    });

    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/v1/events/me/kits");
    expect(init?.method).toBe("GET");
    expect(init?.credentials).toBe("include");
    expect(init?.headers).toEqual({ Accept: "application/json" });
    expect(init?.body).toBeUndefined();
    expect(
      JSON.stringify(init?.headers ?? {}).toLowerCase().includes("authorization"),
    ).toBe(false);
  });

  it("returns empty list on 200 { data: [] }", async () => {
    const getMyKits = createHttpGetMyKits({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => jsonResponse({ data: [] }),
    });

    await expect(getMyKits()).resolves.toEqual({
      ok: true,
      data: [],
    });
  });

  it("returns UNAUTHORIZED on 401", async () => {
    const getMyKits = createHttpGetMyKits({
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

    await expect(getMyKits()).resolves.toEqual({
      ok: false,
      reason: "UNAUTHORIZED",
    });
  });

  it("returns NETWORK on fetch failure", async () => {
    const getMyKits = createHttpGetMyKits({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => {
        throw new TypeError("Failed to fetch");
      },
    });

    await expect(getMyKits()).resolves.toEqual({
      ok: false,
      reason: "NETWORK",
    });
  });

  it("does not accept userId — factory and adapter have zero required args", () => {
    expect(createHttpGetMyKits.length).toBe(0);
    const fn = createHttpGetMyKits({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => jsonResponse({ data: [] }),
    });
    expect(fn.length).toBe(0);
  });
});
