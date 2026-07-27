/**
 * Application contracts for coupons listing (Home MVP).
 */

export type CouponPartnerSummary = {
  id: string;
  name: string;
  slug: string;
};

export type CouponListItem = {
  id: string;
  title: string;
  discountLabel: string;
  partnerName?: string;
  expiresAtLabel?: string;
  href: string;
};

export type CouponsListPagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type GetCouponsListParams = {
  page: number;
  perPage: number;
  active: boolean;
  sort: "expiresAt" | "title" | "createdAt";
  order: "asc" | "desc";
};

export type GetCouponsListResult =
  | {
      status: "success";
      coupons: CouponListItem[];
      pagination: CouponsListPagination;
    }
  | {
      status: "error";
      message: string;
    };

export const COUPONS_LIST_DEFAULT_PAGE = 1;
export const COUPONS_LIST_DEFAULT_PER_PAGE = 4;
export const COUPONS_LIST_DEFAULT_SORT: GetCouponsListParams["sort"] =
  "expiresAt";
export const COUPONS_LIST_DEFAULT_ORDER: GetCouponsListParams["order"] = "asc";
export const COUPONS_LIST_DEFAULT_ACTIVE = true;
