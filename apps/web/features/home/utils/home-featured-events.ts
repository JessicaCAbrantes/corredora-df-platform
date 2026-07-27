import type {
  EventListItem,
  GetEventsListParams,
  GetEventsListResult,
} from "../../events/types/events-list";

export const HOME_FEATURED_EVENTS_PER_PAGE = 6;
export const HOME_FEATURED_EVENTS_LIST_HREF = "/corridas";
export const HOME_FEATURED_EVENTS_EMPTY_MESSAGE =
  "Nenhuma corrida disponível.";
export const HOME_FEATURED_EVENTS_ERROR_MESSAGE =
  "Não foi possível carregar as corridas.";
export const HOME_FEATURED_EVENTS_LOADING_MESSAGE = "Carregando corridas…";

/**
 * Query for Home Featured Events — only existing GET /events params.
 * dateFrom = calendar day of `now` in UTC (YYYY-MM-DD).
 */
export function buildHomeFeaturedEventsParams(
  now: Date = new Date(),
): GetEventsListParams {
  return {
    page: 1,
    perPage: HOME_FEATURED_EVENTS_PER_PAGE,
    status: "active",
    dateFrom: now.toISOString().slice(0, 10),
    sort: "date",
    order: "asc",
  };
}

export type FeaturedEventCardModel = EventListItem & {
  href: string;
};

export type FeaturedEventsPresentation =
  | { status: "empty"; message: string; listHref: string }
  | { status: "error"; message: string; listHref: string }
  | { status: "ready"; events: FeaturedEventCardModel[]; listHref: string };

/**
 * Presentational mapping for FeaturedEvents — no HTTP, no new EventCard fields.
 */
export function toFeaturedEventsPresentation(
  result: GetEventsListResult,
): FeaturedEventsPresentation {
  const listHref = HOME_FEATURED_EVENTS_LIST_HREF;

  if (result.status === "error") {
    return {
      status: "error",
      message: result.message || HOME_FEATURED_EVENTS_ERROR_MESSAGE,
      listHref,
    };
  }

  if (result.events.length === 0) {
    return {
      status: "empty",
      message: HOME_FEATURED_EVENTS_EMPTY_MESSAGE,
      listHref,
    };
  }

  return {
    status: "ready",
    listHref,
    events: result.events.map((event) => ({
      ...event,
      href: `${HOME_FEATURED_EVENTS_LIST_HREF}/${event.slug}`,
    })),
  };
}
