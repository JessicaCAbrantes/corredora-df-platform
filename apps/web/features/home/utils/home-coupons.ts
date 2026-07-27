import type {
  GetCouponsListParams,
  GetCouponsListResult,
  CouponListItem,
} from "../../coupons/types/coupons-list";

export const HOME_COUPONS_PER_PAGE = 4;
export const HOME_COUPONS_LIST_HREF = "/cupons";
export const HOME_COUPONS_EMPTY_MESSAGE = "Nenhum cupom disponível.";
export const HOME_COUPONS_ERROR_MESSAGE =
  "Não foi possível carregar os cupons.";

export function buildHomeCouponsParams(): GetCouponsListParams {
  return {
    page: 1,
    perPage: HOME_COUPONS_PER_PAGE,
    active: true,
    sort: "expiresAt",
    order: "asc",
  };
}

export type HomeCouponsPresentation =
  | { status: "empty"; message: string; listHref: string }
  | { status: "error"; message: string; listHref: string }
  | { status: "ready"; coupons: CouponListItem[]; listHref: string };

export function toHomeCouponsPresentation(
  result: GetCouponsListResult,
): HomeCouponsPresentation {
  const listHref = HOME_COUPONS_LIST_HREF;

  if (result.status === "error") {
    return {
      status: "error",
      message: result.message || HOME_COUPONS_ERROR_MESSAGE,
      listHref,
    };
  }

  if (result.coupons.length === 0) {
    return {
      status: "empty",
      message: HOME_COUPONS_EMPTY_MESSAGE,
      listHref,
    };
  }

  return {
    status: "ready",
    coupons: result.coupons,
    listHref,
  };
}
