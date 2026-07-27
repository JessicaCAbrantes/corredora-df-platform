import type {
  GetPartnersListParams,
  GetPartnersListResult,
  PartnerListItem,
} from "../../partners/types/partners-list";

export const HOME_PARTNERS_PER_PAGE = 8;
export const HOME_PARTNERS_LIST_HREF = "/parceiros";
export const HOME_PARTNERS_EMPTY_MESSAGE = "Nenhum parceiro disponível.";
export const HOME_PARTNERS_ERROR_MESSAGE =
  "Não foi possível carregar os parceiros.";

export function buildHomePartnersParams(): GetPartnersListParams {
  return {
    page: 1,
    perPage: HOME_PARTNERS_PER_PAGE,
    active: true,
    sort: "name",
    order: "asc",
  };
}

export type HomePartnersPresentation =
  | { status: "empty"; message: string; listHref: string }
  | { status: "error"; message: string; listHref: string }
  | { status: "ready"; partners: PartnerListItem[]; listHref: string };

export function toHomePartnersPresentation(
  result: GetPartnersListResult,
): HomePartnersPresentation {
  const listHref = HOME_PARTNERS_LIST_HREF;

  if (result.status === "error") {
    return {
      status: "error",
      message: result.message || HOME_PARTNERS_ERROR_MESSAGE,
      listHref,
    };
  }

  if (result.partners.length === 0) {
    return {
      status: "empty",
      message: HOME_PARTNERS_EMPTY_MESSAGE,
      listHref,
    };
  }

  return {
    status: "ready",
    partners: result.partners,
    listHref,
  };
}
