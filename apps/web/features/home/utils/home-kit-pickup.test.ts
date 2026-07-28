import { describe, expect, it } from "vitest";
import type { GetKitPickupServicesListResult } from "../../kit-pickup-services/types/kit-pickup-services-list";
import {
  HOME_KIT_PICKUP_EMPTY_MESSAGE,
  HOME_KIT_PICKUP_ERROR_MESSAGE,
  HOME_KIT_PICKUP_LIST_HREF,
  HOME_KIT_PICKUP_PER_PAGE,
  buildHomeKitPickupParams,
  toHomeKitPickupPresentation,
} from "./home-kit-pickup";

describe("buildHomeKitPickupParams", () => {
  it("uses recommended GET /kit-pickup-services query for Home", () => {
    expect(buildHomeKitPickupParams()).toEqual({
      page: 1,
      perPage: HOME_KIT_PICKUP_PER_PAGE,
      serviceAvailable: true,
      sort: "pickupStartAt",
      order: "asc",
    });
  });
});

describe("toHomeKitPickupPresentation", () => {
  it("maps empty", () => {
    const result: GetKitPickupServicesListResult = {
      status: "success",
      services: [],
      pagination: { page: 1, perPage: 4, total: 0, totalPages: 0 },
    };
    expect(toHomeKitPickupPresentation(result)).toEqual({
      status: "empty",
      message: HOME_KIT_PICKUP_EMPTY_MESSAGE,
      listHref: HOME_KIT_PICKUP_LIST_HREF,
    });
  });

  it("maps error", () => {
    const view = toHomeKitPickupPresentation({ status: "error", message: "" });
    expect(view.status).toBe("error");
    if (view.status !== "error") return;
    expect(view.message).toBe(HOME_KIT_PICKUP_ERROR_MESSAGE);
  });

  it("maps ready", () => {
    const result: GetKitPickupServicesListResult = {
      status: "success",
      services: [
        {
          id: "kps_01_own_event",
          title: "Retirada de kit",
          eventName: "Meia Maratona de Brasília",
          statusLabel: "Retirada em breve",
          href: "/kit-pickup",
          feeAmount: null,
          feeCurrency: "BRL",
          registrationMode: "internal",
          serviceAvailable: true,
        },
      ],
      pagination: { page: 1, perPage: 4, total: 1, totalPages: 1 },
    };
    const view = toHomeKitPickupPresentation(result);
    expect(view.status).toBe("ready");
    if (view.status !== "ready") return;
    expect(view.services[0]?.href).toBe("/kit-pickup");
  });
});
