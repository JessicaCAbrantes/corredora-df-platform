import { describe, expect, it, vi } from "vitest";
import {
  buildKitPickupServicesListQuery,
  createHttpGetKitPickupServices,
} from "./http-get-kit-pickup-services";

const homeParams = {
  page: 1,
  perPage: 4,
  serviceAvailable: true,
  sort: "pickupStartAt" as const,
  order: "asc" as const,
};

describe("createHttpGetKitPickupServices", () => {
  it("GETs without credentials and maps event + labels", async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            id: "kps_01_own_event",
            title: "Retirada de kit",
            event: {
              id: "evt_01_meia",
              name: "Meia Maratona de Brasília",
              slug: "meia-maratona-brasilia",
            },
            statusLabel: "Retirada em breve",
            pickupLabel: "Asa Norte · 10 de ago.–12 de ago.",
            serviceAvailable: true,
            feeAmount: null,
            feeCurrency: "BRL",
            registrationMode: "internal",
          },
        ],
        meta: {
          page: 1,
          perPage: 4,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    }));

    const getServices = createHttpGetKitPickupServices({
      baseUrl: "http://api.test",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    const result = await getServices(homeParams);
    expect(fetchFn).toHaveBeenCalledWith(
      `http://api.test/api/v1/kit-pickup-services?${buildKitPickupServicesListQuery(homeParams)}`,
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
    const init = fetchFn.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.credentials).toBeUndefined();
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.services[0]).toMatchObject({
      title: "Retirada de kit",
      eventName: "Meia Maratona de Brasília",
      href: "/kit-pickup",
      registrationMode: "internal",
    });
  });

  it("returns empty list", async () => {
    const getServices = createHttpGetKitPickupServices({
      baseUrl: "http://api.test",
      fetchFn: (async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          data: [],
          meta: {
            page: 1,
            perPage: 4,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      })) as unknown as typeof fetch,
    });

    await expect(getServices(homeParams)).resolves.toMatchObject({
      status: "success",
      services: [],
    });
  });

  it("rejects payloads with private fields", async () => {
    const getServices = createHttpGetKitPickupServices({
      baseUrl: "http://api.test",
      fetchFn: (async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              id: "kps_x",
              title: "x",
              event: { id: "e", name: "n", slug: "s" },
              statusLabel: "s",
              pickupLabel: null,
              serviceAvailable: true,
              feeAmount: null,
              feeCurrency: "BRL",
              registrationMode: "internal",
              email: "a@b.c",
            },
          ],
          meta: {
            page: 1,
            perPage: 4,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      })) as unknown as typeof fetch,
    });

    await expect(getServices(homeParams)).resolves.toMatchObject({
      status: "error",
    });
  });

  it("returns error on network failure", async () => {
    const getServices = createHttpGetKitPickupServices({
      baseUrl: "http://api.test",
      fetchFn: (async () => {
        throw new Error("network");
      }) as unknown as typeof fetch,
    });

    await expect(getServices(homeParams)).resolves.toMatchObject({
      status: "error",
    });
  });
});
