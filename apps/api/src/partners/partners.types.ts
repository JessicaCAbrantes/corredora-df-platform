export type PartnerDto = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  logo: string | null;
  website: string | null;
  active: boolean;
};

export type PartnersListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PartnersListResponse = {
  data: PartnerDto[];
  meta: PartnersListMeta;
};
