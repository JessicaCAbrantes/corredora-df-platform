import { createHttpGetCoupons } from "../infrastructure/http-get-coupons";
import type {
  GetCouponsListParams,
  GetCouponsListResult,
} from "../types/coupons-list";

const httpGetCoupons = createHttpGetCoupons();

/**
 * Application-facing fetch for the coupons listing (Home MVP).
 */
export async function getCouponsList(
  params: GetCouponsListParams,
): Promise<GetCouponsListResult> {
  return httpGetCoupons(params);
}
