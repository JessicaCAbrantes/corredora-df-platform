import { createHttpGetKitPickupServices } from "../infrastructure/http-get-kit-pickup-services";
import type {
  GetKitPickupServicesListParams,
  GetKitPickupServicesListResult,
} from "../types/kit-pickup-services-list";

const httpGetKitPickupServices = createHttpGetKitPickupServices();

/**
 * Application-facing fetch for kit pickup services (Home Phase 1).
 */
export async function getKitPickupServicesList(
  params: GetKitPickupServicesListParams,
): Promise<GetKitPickupServicesListResult> {
  return httpGetKitPickupServices(params);
}
