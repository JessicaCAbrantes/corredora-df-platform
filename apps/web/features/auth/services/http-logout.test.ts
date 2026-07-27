import { describe, expect, it, vi } from "vitest";
import { createHttpLogout } from "./http-logout";

describe("createHttpLogout", () => {
  it("POSTs logout with credentials include and no body on 204", async () => {
    const fetchFn = vi.fn(async () => new Response(null, { status: 204 }));
    const logout = createHttpLogout({
      baseUrl: "http://localhost:3001",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await expect(logout()).resolves.toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/v1/auth/logout");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(init?.body).toBeUndefined();
  });

  it("treats other 2xx as success", async () => {
    const logout = createHttpLogout({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => new Response(null, { status: 200 }),
    });

    await expect(logout()).resolves.toEqual({ ok: true });
  });

  it("maps HTTP 500 to error", async () => {
    const logout = createHttpLogout({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => new Response("error", { status: 500 }),
    });

    await expect(logout()).resolves.toEqual({ ok: false });
  });

  it("maps network errors to error", async () => {
    const logout = createHttpLogout({
      baseUrl: "http://localhost:3001",
      fetchFn: async () => {
        throw new TypeError("Failed to fetch");
      },
    });

    await expect(logout()).resolves.toEqual({ ok: false });
  });
});
