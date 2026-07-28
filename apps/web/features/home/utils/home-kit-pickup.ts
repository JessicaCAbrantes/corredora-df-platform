import type {
  GetKitPickupServicesListParams,
  GetKitPickupServicesListResult,
  KitPickupServiceListItem,
} from "../../kit-pickup-services/types/kit-pickup-services-list";

export const HOME_KIT_PICKUP_PER_PAGE = 4;
export const HOME_KIT_PICKUP_LIST_HREF = "/kit-pickup";
export const HOME_KIT_PICKUP_EMPTY_MESSAGE =
  "Nenhum serviço de retirada disponível no momento.";
export const HOME_KIT_PICKUP_ERROR_MESSAGE =
  "Não foi possível carregar os serviços de retirada.";

export function buildHomeKitPickupParams(): GetKitPickupServicesListParams {
  return {
    page: 1,
    perPage: HOME_KIT_PICKUP_PER_PAGE,
    serviceAvailable: true,
    sort: "pickupStartAt",
    order: "asc",
  };
}

export type HomeKitPickupPresentation =
  | { status: "empty"; message: string; listHref: string }
  | { status: "error"; message: string; listHref: string }
  | {
      status: "ready";
      services: KitPickupServiceListItem[];
      listHref: string;
    };

export function toHomeKitPickupPresentation(
  result: GetKitPickupServicesListResult,
): HomeKitPickupPresentation {
  const listHref = HOME_KIT_PICKUP_LIST_HREF;

  if (result.status === "error") {
    return {
      status: "error",
      message: result.message || HOME_KIT_PICKUP_ERROR_MESSAGE,
      listHref,
    };
  }

  if (result.services.length === 0) {
    return {
      status: "empty",
      message: HOME_KIT_PICKUP_EMPTY_MESSAGE,
      listHref,
    };
  }

  return {
    status: "ready",
    services: result.services,
    listHref,
  };
}
