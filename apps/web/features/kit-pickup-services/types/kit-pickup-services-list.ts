/**
 * Application contracts for kit pickup services listing (Home MVP Phase 1).
 */

export type KitPickupServiceEventSummary = {
  id: string;
  name: string;
  slug: string;
};

export type KitPickupServiceListItem = {
  id: string;
  title: string;
  eventName: string;
  event: KitPickupServiceEventSummary;
  statusLabel: string;
  pickupLabel?: string;
  href: string;
  feeAmount: string | null;
  feeCurrency: string;
  registrationMode: "internal" | "external";
  serviceAvailable: boolean;
};

export type KitPickupServicesListPagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type GetKitPickupServicesListParams = {
  page: number;
  perPage: number;
  serviceAvailable: boolean;
  sort: "pickupStartAt" | "title" | "createdAt";
  order: "asc" | "desc";
};

export type GetKitPickupServicesListResult =
  | {
      status: "success";
      services: KitPickupServiceListItem[];
      pagination: KitPickupServicesListPagination;
    }
  | {
      status: "error";
      message: string;
    };

export const KIT_PICKUP_SERVICES_LIST_DEFAULT_PAGE = 1;
export const KIT_PICKUP_SERVICES_LIST_DEFAULT_PER_PAGE = 4;
export const KIT_PICKUP_SERVICES_LIST_DEFAULT_SORT: GetKitPickupServicesListParams["sort"] =
  "pickupStartAt";
export const KIT_PICKUP_SERVICES_LIST_DEFAULT_ORDER: GetKitPickupServicesListParams["order"] =
  "asc";
export const KIT_PICKUP_SERVICES_LIST_DEFAULT_AVAILABLE = true;
