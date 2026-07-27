export type EventHttpCategory =
  | "marathon"
  | "half-marathon"
  | "5k"
  | "10k"
  | "trail";

export type EventHttpLifecycleStatus = "active" | "cancelled" | "completed";

export type EventHttpRegistrationStatus = "open" | "closed" | "upcoming";

export type EventDto = {
  id: string;
  name: string;
  slug: string;
  date: string;
  city: string;
  category: EventHttpCategory;
  distance: string;
  status: EventHttpLifecycleStatus;
  registrationStatus: EventHttpRegistrationStatus;
  registrationOpen: boolean;
  price: { amount: number; currency: string } | null;
  coverImage: string;
};

export type EventsListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type EventsListResponse = {
  data: EventDto[];
  meta: EventsListMeta;
};

/** GET /events/by-slug/:slug — MVP A (degraded kit/route/schedule/regulation). */
export type EventDetailsDto = {
  id: string;
  slug: string;
  name: string;
  date: string;
  city: string;
  distance: string;
  status: EventHttpLifecycleStatus;
  registrationStatus: EventHttpRegistrationStatus;
  registrationOpen: boolean;
  price: { amount: number; currency: string } | null;
  coverImage: string;
  kit: {
    available: boolean;
    description: string;
  };
  route: {
    available: boolean;
    summary: string;
    distanceLabel: string;
  };
  schedule: {
    items: Array<{
      id: string;
      label: string;
      timeLabel: string;
    }>;
  };
  regulation: {
    summary: string;
    href: string;
    linkLabel: string;
  };
};

export type EventDetailsResponse = {
  data: EventDetailsDto;
};

/** POST /events/:id/register — success envelope. */
export type RegisterForEventResponse = {
  data: {
    registrationId: string;
  };
};

/** GET /events/me/registrations — My Registrations MVP (read-only). */
export type MyRegistrationEventDto = {
  id: string;
  slug: string;
  name: string;
  date: string;
  city: string;
  distance: string;
  status: EventHttpLifecycleStatus;
  registrationStatus: EventHttpRegistrationStatus;
  coverImage: string;
};

export type MyRegistrationItemDto = {
  registrationId: string;
  registeredAt: string;
  event: MyRegistrationEventDto;
};

export type MyRegistrationsResponse = {
  data: MyRegistrationItemDto[];
};

/** GET /events/me/kits — Kits / Retirada de Kits MVP (read-only). */
export type MyKitEventDto = {
  id: string;
  slug: string;
  name: string;
  date: string;
  city: string;
  distance: string;
};

export type MyKitItemDto = {
  kitId: string;
  status: "available";
  event: MyKitEventDto;
};

export type MyKitsResponse = {
  data: MyKitItemDto[];
};
