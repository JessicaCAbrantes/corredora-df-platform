import { describe, expect, it, vi } from "vitest";
import {
  buildPartnersListQuery,
  createHttpGetPartners,
} from "./http-get-partners";

describe("buildPartnersListQuery", () => {
  it("sends Home defaults including active=true", () => {
    const qs = buildPartnersListQuery({
      page: 1,
      perPage: 8,
      active: true,
      sort: "name",
      order: "asc",
    });

    expect(qs).toContain("page=1");
    expect(qs).toContain("perPage=8");
    expect(qs).toContain("active=true");
    expect(qs).toContain("sort=name");
    expect(qs).toContain("order=asc");
  });
});

describe("createHttpGetPartners", () => {
  it("calls GET without credentials and maps partners", async () => {
    const fetchFn = vi.fn(async () =>
      Response.json({
        data: [
          {
            id: "ptr_01_nike",
            name: "Nike Running",
            slug: "nike-running",
            category: "Equipamento",
            logo: null,
            website: "https://www.nike.com",
            active: true,
          },
        ],
        meta: {
          page: 1,
          perPage: 8,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );

    const getPartners = createHttpGetPartners({
      baseUrl: "http://api.test",
      fetchFn,
    });

    const result = await getPartners({
      page: 1,
      perPage: 8,
      active: true,
      sort: "name",
      order: "asc",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "http://api.test/api/v1/partners?page=1&perPage=8&sort=name&order=asc&active=true",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
    const init = fetchFn.mock.calls[0]?.[1] as RequestInit;
    expect(init.credentials).toBeUndefined();

    expect(result).toEqual({
      status: "success",
      partners: [
        {
          id: "ptr_01_nike",
          name: "Nike Running",
          slug: "nike-running",
          category: "Equipamento",
          href: "/parceiros/nike-running",
        },
      ],
      pagination: {
        page: 1,
        perPage: 8,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it("returns success with empty list", async () => {
    const getPartners = createHttpGetPartners({
      baseUrl: "http://api.test",
      fetchFn: async () =>
        Response.json({
          data: [],
          meta: {
            page: 1,
            perPage: 8,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
    });

    await expect(
      getPartners({
        page: 1,
        perPage: 8,
        active: true,
        sort: "name",
        order: "asc",
      }),
    ).resolves.toMatchObject({
      status: "success",
      partners: [],
    });
  });

  it("returns error on network failure", async () => {
    const getPartners = createHttpGetPartners({
      baseUrl: "http://api.test",
      fetchFn: async () => {
        throw new Error("offline");
      },
    });

    await expect(
      getPartners({
        page: 1,
        perPage: 8,
        active: true,
        sort: "name",
        order: "asc",
      }),
    ).resolves.toMatchObject({ status: "error" });
  });
});
