import { describe, expect, it, vi } from "vitest";
import { createHttpCancelEventRegistration } from "./http-cancel-event-registration";

function emptyResponse(status: number): Response {
  return new Response(null, { status });
}

describe("createHttpCancelEventRegistration", () => {
  it("returns ok on 204 with credentials include and no body", async () => {
    const fetchFn = vi.fn(async () => emptyResponse(204));
    const cancel = createHttpCancelEventRegistration({
      baseUrl: "http://localhost:3001",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await expect(cancel("evt_01_meia")).resolves.toEqual({ ok: true });

    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe(
      "http://localhost:3001/api/v1/events/evt_01_meia/register",
    );
    expect(init?.method).toBe("DELETE");
    expect(init?.credentials).toBe("include");
    expect(init?.headers).toEqual({ Accept: "application/json" });
    expect(init?.body).toBeUndefined();
    expect(
      JSON.stringify(init?.headers ?? {}).toLowerCase().includes("authorization"),
    ).toBe(false);
  });

  it("returns UNAUTHORIZED on 401", async () => {
    const cancel = createHttpCancelEventRegistration({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => emptyResponse(401),
    });

    await expect(cancel("evt_01_meia")).resolves.toEqual({
      ok: false,
      reason: "UNAUTHORIZED",
    });
  });

  it("returns NOT_FOUND on 404", async () => {
    const cancel = createHttpCancelEventRegistration({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => emptyResponse(404),
    });

    await expect(cancel("evt_01_meia")).resolves.toEqual({
      ok: false,
      reason: "NOT_FOUND",
    });
  });

  it("returns NETWORK on fetch failure", async () => {
    const cancel = createHttpCancelEventRegistration({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => {
        throw new TypeError("Failed to fetch");
      },
    });

    await expect(cancel("evt_missing")).resolves.toEqual({
      ok: false,
      reason: "NETWORK",
    });
  });

  it("does not accept userId — only eventId argument", () => {
    const cancel = createHttpCancelEventRegistration({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => emptyResponse(204),
    });
    expect(cancel.length).toBe(1);
  });
});
