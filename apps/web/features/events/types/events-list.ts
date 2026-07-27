/**
 * Application contracts for events listing.
 * Flattened for EventCard — not the HTTP EventDTO.
 */

export type EventListStatus = "open" | "closed" | "upcoming";

export type EventLifecycleStatus = "active" | "cancelled" | "completed";

export type EventCategory =
  | "marathon"
  | "half-marathon"
  | "5k"
  | "10k"
  | "trail";

export type EventListSortField = "date" | "name" | "createdAt";

export type EventListSortOrder = "asc" | "desc";

export interface EventListItem {
  slug: string;
  title: string;
  /** Human-readable date label for EventCard */
  date: string;
  /** Machine-readable date for <time dateTime> (YYYY-MM-DD) */
  dateTime: string;
  city: string;
  distance: string;
  /**
   * Formatted price label. Omitted only for explicitly free events
   * (after Adapter/mock interprets price: null).
   */
  price?: string;
  /** Presentational registration badge for EventCard */
  status: EventListStatus;
  image?: {
    src?: string;
    alt: string;
  };
}

export type EventsListPagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

/**
 * Normalized Application params — never URLSearchParams / HTTP strings.
 */
export type GetEventsListParams = {
  page: number;
  perPage: number;
  search?: string;
  status?: EventLifecycleStatus;
  category?: EventCategory;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  registrationOpen?: boolean;
  sort: EventListSortField;
  order: EventListSortOrder;
};

export type GetEventsListResult =
  | {
      status: "success";
      events: EventListItem[];
      pagination: EventsListPagination;
    }
  | {
      status: "error";
      message: string;
    };

export const EVENTS_LIST_DEFAULT_PAGE = 1;
export const EVENTS_LIST_DEFAULT_PER_PAGE = 20;
export const EVENTS_LIST_MAX_PER_PAGE = 100;
export const EVENTS_LIST_DEFAULT_SORT: EventListSortField = "date";
export const EVENTS_LIST_DEFAULT_ORDER: EventListSortOrder = "asc";
