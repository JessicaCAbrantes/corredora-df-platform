import { describe, expect, it, vi } from "vitest";
import {
  buildCouponsListQuery,
  createHttpGetCoupons,
} from "./http-get-coupons";

describe("buildCouponsListQuery", () => {
  it("sends Home defaults including active=true", () => {
    const qs = buildCouponsListQuery({
      page: 1,
      perPage: 4,
      active: true,
      sort: "expiresAt",
      order: "asc",
    });

    expect(qs).toContain("page=1");
    expect(qs).toContain("perPage=4");
    expect(qs).toContain("active=true");
    expect(qs).toContain("sort=expiresAt");
    expect(qs).toContain("order=asc");
  });
});

describe("createHttpGetCoupons", () => {
  it("GETs without credentials and maps partner name", async () => {
    const fetchFn = vi.fn(async () =>
      Response.json({
        data: [
          {
            id: "cpn_02_running",
            title: "Desconto em inscrição selecionada",
            discountLabel: "15% OFF",
            expiresAt: "2026-12-31T23:59:59.000Z",
            active: true,
            partner: {
              id: "ptr_01_nike",
              name: "Nike Running",
              slug: "nike-running",
            },
          },
          {
            id: "cpn_01_welcome",
            title: "Cupom bem-vindo",
            discountLabel: "10% OFF",
            expiresAt: "2026-08-31T23:59:59.000Z",
            active: true,
            partner: null,
          },
        ],
        meta: {
          page: 1,
          perPage: 4,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    const getCoupons = createHttpGetCoupons({
      baseUrl: "http://api.test",
      fetchFn,
    });

    const result = await getCoupons({
      page: 1,
      perPage: 4,
      active: true,
      sort: "expiresAt",
      order: "asc",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "http://api.test/api/v1/coupons?page=1&perPage=4&sort=expiresAt&order=asc&active=true",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
    const init = fetchFn.mock.calls[0]?.[1] as RequestInit;
    expect(init.credentials).toBeUndefined();

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.coupons[0]).toMatchObject({
      title: "Desconto em inscrição selecionada",
      discountLabel: "15% OFF",
      partnerName: "Nike Running",
      href: "/cupons",
    });
    expect(result.coupons[0]?.expiresAtLabel).toBeTruthy();
    expect(result.coupons[1]?.partnerName).toBeUndefined();
  });

  it("returns empty list on success", async () => {
    const getCoupons = createHttpGetCoupons({
      baseUrl: "http://api.test",
      fetchFn: async () =>
        Response.json({
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
    });

    await expect(
      getCoupons({
        page: 1,
        perPage: 4,
        active: true,
        sort: "expiresAt",
        order: "asc",
      }),
    ).resolves.toMatchObject({ status: "success", coupons: [] });
  });

  it("rejects payloads that expose code", async () => {
    const getCoupons = createHttpGetCoupons({
      baseUrl: "http://api.test",
      fetchFn: async () =>
        Response.json({
          data: [
            {
              id: "cpn_x",
              title: "X",
              discountLabel: "1%",
              expiresAt: null,
              active: true,
              partner: null,
              code: "SECRET",
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
    });

    await expect(
      getCoupons({
        page: 1,
        perPage: 4,
        active: true,
        sort: "expiresAt",
        order: "asc",
      }),
    ).resolves.toMatchObject({ status: "error" });
  });

  it("returns error on network failure", async () => {
    const getCoupons = createHttpGetCoupons({
      baseUrl: "http://api.test",
      fetchFn: async () => {
        throw new Error("offline");
      },
    });

    await expect(
      getCoupons({
        page: 1,
        perPage: 4,
        active: true,
        sort: "expiresAt",
        order: "asc",
      }),
    ).resolves.toMatchObject({ status: "error" });
  });
});
