import { createHttpGetEventDetails } from "../infrastructure/http-get-event-details";
import type { EventDetailsFetchResult } from "../types/event-details";

const httpGetEventDetails = createHttpGetEventDetails();

/**
 * Application-facing fetch for event details.
 * Delegates to HttpGetEventDetails — Mock remains in the repo but is no longer used here.
 */
export async function getEventDetails(
  slug: string,
): Promise<EventDetailsFetchResult> {
  return httpGetEventDetails(slug);
}
