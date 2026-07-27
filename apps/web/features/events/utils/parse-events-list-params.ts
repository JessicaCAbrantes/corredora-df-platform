import type {
  EventCategory,
  EventLifecycleStatus,
  EventListSortField,
  EventListSortOrder,
  GetEventsListParams,
} from "../types/events-list";
import {
  EVENTS_LIST_DEFAULT_ORDER,
  EVENTS_LIST_DEFAULT_PAGE,
  EVENTS_LIST_DEFAULT_PER_PAGE,
  EVENTS_LIST_DEFAULT_SORT,
  EVENTS_LIST_MAX_PER_PAGE,
} from "../types/events-list";

type SearchParamValue = string | string[] | undefined;

export type EventsListSearchParamsInput = Record<
  string,
  SearchParamValue
>;

const LIFECYCLE_STATUSES = new Set<EventLifecycleStatus>([
  "active",
  "cancelled",
  "completed",
]);

const CATEGORIES = new Set<EventCategory>([
  "marathon",
  "half-marathon",
  "5k",
  "10k",
  "trail",
]);

const SORT_FIELDS = new Set<EventListSortField>([
  "date",
  "name",
  "createdAt",
]);

const SORT_ORDERS = new Set<EventListSortOrder>(["asc", "desc"]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function firstValue(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parsePositiveInt(
  raw: string | undefined,
  fallback: number,
): number {
  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

/**
 * Route Boundary helper — converts Next.js searchParams into
 * normalized GetEventsListParams. Invalid enums are ignored.
 */
export function parseEventsListParams(
  searchParams: EventsListSearchParamsInput,
): GetEventsListParams {
  const pageRaw = parsePositiveInt(
    firstValue(searchParams.page),
    EVENTS_LIST_DEFAULT_PAGE,
  );
  const page = pageRaw >= 1 ? pageRaw : EVENTS_LIST_DEFAULT_PAGE;

  let perPage = parsePositiveInt(
    firstValue(searchParams.perPage),
    EVENTS_LIST_DEFAULT_PER_PAGE,
  );
  if (perPage < 1 || perPage > EVENTS_LIST_MAX_PER_PAGE) {
    perPage = EVENTS_LIST_DEFAULT_PER_PAGE;
  }

  const sortRaw = firstValue(searchParams.sort);
  const sort: EventListSortField =
    sortRaw && SORT_FIELDS.has(sortRaw as EventListSortField)
      ? (sortRaw as EventListSortField)
      : EVENTS_LIST_DEFAULT_SORT;

  const orderRaw = firstValue(searchParams.order);
  const order: EventListSortOrder =
    orderRaw && SORT_ORDERS.has(orderRaw as EventListSortOrder)
      ? (orderRaw as EventListSortOrder)
      : EVENTS_LIST_DEFAULT_ORDER;

  const params: GetEventsListParams = {
    page,
    perPage,
    sort,
    order,
  };

  const search = firstValue(searchParams.search)?.trim();
  if (search) {
    params.search = search;
  }

  const status = firstValue(searchParams.status);
  if (status && LIFECYCLE_STATUSES.has(status as EventLifecycleStatus)) {
    params.status = status as EventLifecycleStatus;
  }

  const category = firstValue(searchParams.category);
  if (category && CATEGORIES.has(category as EventCategory)) {
    params.category = category as EventCategory;
  }

  const city = firstValue(searchParams.city)?.trim();
  if (city) {
    params.city = city;
  }

  const dateFrom = firstValue(searchParams.dateFrom)?.trim();
  if (dateFrom && ISO_DATE.test(dateFrom)) {
    params.dateFrom = dateFrom;
  }

  const dateTo = firstValue(searchParams.dateTo)?.trim();
  if (dateTo && ISO_DATE.test(dateTo)) {
    params.dateTo = dateTo;
  }

  const registrationOpenRaw = firstValue(searchParams.registrationOpen);
  if (registrationOpenRaw === "true") {
    params.registrationOpen = true;
  } else if (registrationOpenRaw === "false") {
    params.registrationOpen = false;
  }

  return params;
}
