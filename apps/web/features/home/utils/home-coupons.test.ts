import { describe, expect, it } from "vitest";
import type { GetCouponsListResult } from "../../coupons/types/coupons-list";
import {
  HOME_COUPONS_EMPTY_MESSAGE,
  HOME_COUPONS_ERROR_MESSAGE,
  HOME_COUPONS_LIST_HREF,
  HOME_COUPONS_PER_PAGE,
  buildHomeCouponsParams,
  toHomeCouponsPresentation,
} from "./home-coupons";

describe("buildHomeCouponsParams", () => {
  it("uses recommended GET /coupons query for Home", () => {
    expect(buildHomeCouponsParams()).toEqual({
      page: 1,
      perPage: HOME_COUPONS_PER_PAGE,
      active: true,
      sort: "expiresAt",
      order: "asc",
    });
  });
});

describe("toHomeCouponsPresentation", () => {
  it("maps empty", () => {
    const result: GetCouponsListResult = {
      status: "success",
      coupons: [],
      pagination: { page: 1, perPage: 4, total: 0, totalPages: 0 },
    };
    expect(toHomeCouponsPresentation(result)).toEqual({
      status: "empty",
      message: HOME_COUPONS_EMPTY_MESSAGE,
      listHref: HOME_COUPONS_LIST_HREF,
    });
  });

  it("maps error", () => {
    const view = toHomeCouponsPresentation({ status: "error", message: "" });
    expect(view.status).toBe("error");
    if (view.status !== "error") return;
    expect(view.message).toBe(HOME_COUPONS_ERROR_MESSAGE);
  });

  it("maps ready", () => {
    const result: GetCouponsListResult = {
      status: "success",
      coupons: [
        {
          id: "cpn_01_welcome",
          title: "Cupom bem-vindo",
          discountLabel: "10% OFF",
          href: "/cupons",
        },
      ],
      pagination: { page: 1, perPage: 4, total: 1, totalPages: 1 },
    };
    const view = toHomeCouponsPresentation(result);
    expect(view.status).toBe("ready");
    if (view.status !== "ready") return;
    expect(view.coupons[0]?.title).toBe("Cupom bem-vindo");
  });
});
