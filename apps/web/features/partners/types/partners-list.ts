/**
 * Application contracts for partners listing (Home MVP).
 */

export type PartnerListItem = {
  id: string;
  name: string;
  slug: string;
  category?: string;
  href: string;
};

export type PartnersListPagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type GetPartnersListParams = {
  page: number;
  perPage: number;
  active: boolean;
  sort: "name" | "createdAt";
  order: "asc" | "desc";
};

export type GetPartnersListResult =
  | {
      status: "success";
      partners: PartnerListItem[];
      pagination: PartnersListPagination;
    }
  | {
      status: "error";
      message: string;
    };

export const PARTNERS_LIST_DEFAULT_PAGE = 1;
export const PARTNERS_LIST_DEFAULT_PER_PAGE = 8;
export const PARTNERS_LIST_MAX_PER_PAGE = 100;
export const PARTNERS_LIST_DEFAULT_SORT: GetPartnersListParams["sort"] = "name";
export const PARTNERS_LIST_DEFAULT_ORDER: GetPartnersListParams["order"] =
  "asc";
export const PARTNERS_LIST_DEFAULT_ACTIVE = true;
