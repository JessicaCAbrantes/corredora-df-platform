import { createHttpGetPartners } from "../infrastructure/http-get-partners";
import type {
  GetPartnersListParams,
  GetPartnersListResult,
} from "../types/partners-list";

const httpGetPartners = createHttpGetPartners();

/**
 * Application-facing fetch for the partners listing (Home MVP).
 */
export async function getPartnersList(
  params: GetPartnersListParams,
): Promise<GetPartnersListResult> {
  return httpGetPartners(params);
}
