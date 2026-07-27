export type CouponPartnerDto = {
  id: string;
  name: string;
  slug: string;
};

export type CouponDto = {
  id: string;
  title: string;
  discountLabel: string;
  expiresAt: string | null;
  active: boolean;
  partner: CouponPartnerDto | null;
};

export type CouponsListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type CouponsListResponse = {
  data: CouponDto[];
  meta: CouponsListMeta;
};
