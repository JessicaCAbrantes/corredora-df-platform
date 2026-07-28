export type KitPickupServiceEventDto = {
  id: string;
  name: string;
  slug: string;
};

export type KitPickupServiceDto = {
  id: string;
  title: string;
  event: KitPickupServiceEventDto;
  statusLabel: string;
  pickupLabel: string | null;
  serviceAvailable: boolean;
  feeAmount: string | null;
  feeCurrency: string;
  registrationMode: "internal" | "external";
};

export type KitPickupServicesListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type KitPickupServicesListResponse = {
  data: KitPickupServiceDto[];
  meta: KitPickupServicesListMeta;
};
