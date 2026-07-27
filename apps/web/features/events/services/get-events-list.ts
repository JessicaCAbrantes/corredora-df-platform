import { createHttpGetEvents } from "../infrastructure/http-get-events";
import type {
  GetEventsListParams,
  GetEventsListResult,
} from "../types/events-list";

const httpGetEvents = createHttpGetEvents();

/**
 * Application-facing fetch for the events listing.
 * Delegates to HttpGetEvents — Mock remains in the repo but is no longer used here.
 */
export async function getEventsList(
  params: GetEventsListParams,
): Promise<GetEventsListResult> {
  return httpGetEvents(params);
}
