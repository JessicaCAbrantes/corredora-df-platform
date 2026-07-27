import { describe, expect, it } from "vitest";
import type { GetPartnersListResult } from "../../partners/types/partners-list";
import {
  HOME_PARTNERS_EMPTY_MESSAGE,
  HOME_PARTNERS_ERROR_MESSAGE,
  HOME_PARTNERS_LIST_HREF,
  HOME_PARTNERS_PER_PAGE,
  buildHomePartnersParams,
  toHomePartnersPresentation,
} from "./home-partners";

describe("buildHomePartnersParams", () => {
  it("uses recommended GET /partners query for Home", () => {
    expect(buildHomePartnersParams()).toEqual({
      page: 1,
      perPage: HOME_PARTNERS_PER_PAGE,
      active: true,
      sort: "name",
      order: "asc",
    });
  });
});

describe("toHomePartnersPresentation", () => {
  it("maps empty success", () => {
    const result: GetPartnersListResult = {
      status: "success",
      partners: [],
      pagination: { page: 1, perPage: 8, total: 0, totalPages: 0 },
    };

    expect(toHomePartnersPresentation(result)).toEqual({
      status: "empty",
      message: HOME_PARTNERS_EMPTY_MESSAGE,
      listHref: HOME_PARTNERS_LIST_HREF,
    });
  });

  it("maps error", () => {
    const result: GetPartnersListResult = {
      status: "error",
      message: "",
    };

    const view = toHomePartnersPresentation(result);
    expect(view.status).toBe("error");
    if (view.status !== "error") return;
    expect(view.message).toBe(HOME_PARTNERS_ERROR_MESSAGE);
    expect(view.listHref).toBe("/parceiros");
  });

  it("maps ready partners with PartnerCard fields", () => {
    const result: GetPartnersListResult = {
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
      pagination: { page: 1, perPage: 8, total: 1, totalPages: 1 },
    };

    const view = toHomePartnersPresentation(result);
    expect(view.status).toBe("ready");
    if (view.status !== "ready") return;
    expect(view.partners[0]?.name).toBe("Nike Running");
    expect(view.partners[0]?.href).toBe("/parceiros/nike-running");
  });
});
