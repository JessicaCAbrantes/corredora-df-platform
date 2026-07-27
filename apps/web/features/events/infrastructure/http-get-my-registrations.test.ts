import { describe, expect, it, vi } from "vitest";
import { createHttpGetMyRegistrations } from "./http-get-my-registrations";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const sampleItem = {
  registrationId: "reg_01",
  registeredAt: "2026-07-26T18:00:00.000Z",
  event: {
    id: "evt_e2e_reg_open",
    slug: "e2e-registro-livre",
    name: "E2E Registro Livre DF",
    date: "2026-12-01T00:00:00.000Z",
    city: "Brasília",
    distance: "5K",
    status: "active",
    registrationStatus: "open",
    coverImage: "https://example.com/cover.jpg",
  },
};

describe("createHttpGetMyRegistrations", () => {
  it("returns list on 200 with credentials include and no body", async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ data: [sampleItem] }));
    const getMyRegistrations = createHttpGetMyRegistrations({
      baseUrl: "http://localhost:3001",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await expect(getMyRegistrations()).resolves.toEqual({
      ok: true,
      data: [sampleItem],
    });

    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/v1/events/me/registrations");
    expect(init?.method).toBe("GET");
    expect(init?.credentials).toBe("include");
    expect(init?.headers).toEqual({ Accept: "application/json" });
    expect(init?.body).toBeUndefined();
    expect(
      JSON.stringify(init?.headers ?? {}).toLowerCase().includes("authorization"),
    ).toBe(false);
  });

  it("returns empty list on 200 { data: [] }", async () => {
    const getMyRegistrations = createHttpGetMyRegistrations({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => jsonResponse({ data: [] }),
    });

    await expect(getMyRegistrations()).resolves.toEqual({
      ok: true,
      data: [],
    });
  });

  it("returns UNAUTHORIZED on 401", async () => {
    const getMyRegistrations = createHttpGetMyRegistrations({
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

    await expect(getMyRegistrations()).resolves.toEqual({
      ok: false,
      reason: "UNAUTHORIZED",
    });
  });

  it("returns NETWORK on fetch failure", async () => {
    const getMyRegistrations = createHttpGetMyRegistrations({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => {
        throw new TypeError("Failed to fetch");
      },
    });

    await expect(getMyRegistrations()).resolves.toEqual({
      ok: false,
      reason: "NETWORK",
    });
  });

  it("does not accept userId — factory has zero required args", () => {
    expect(createHttpGetMyRegistrations.length).toBe(0);
    const fn = createHttpGetMyRegistrations({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => jsonResponse({ data: [] }),
    });
    expect(fn.length).toBe(0);
  });
});
