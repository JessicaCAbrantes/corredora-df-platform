/**
 * Domain-shaped data for the event details experience (mock / future API).
 * Presentation receives slices of this via the page — not the raw API root.
 */

export type EventRegistrationStatus = "open" | "closed" | "upcoming";

export interface EventDetailsData {
  id: string;
  slug: string;
  name: string;
  dateLabel: string;
  timeLabel: string;
  distanceLabel: string;
  locationLabel: string;
  imageAlt: string;
  imageSrc?: string;
  registrationStatus: EventRegistrationStatus;
  pricing: {
    currentPriceLabel: string;
    originalPriceLabel?: string;
    discountLabel?: string;
  };
  kit: {
    available: boolean;
    description: string;
    imageSrc?: string;
    imageAlt?: string;
  };
  route: {
    available: boolean;
    summary: string;
    distanceLabel: string;
    imageSrc?: string;
    imageAlt?: string;
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
}

export type EventDetailsFetchResult =
  | { status: "success"; event: EventDetailsData }
  | { status: "not_found" }
  | { status: "error"; message: string };

/** Presentation-only primary action — decided by a simple map on the page. */
export type EventPrimaryActionType = "REGISTER" | "UNAVAILABLE";

export interface EventPrimaryAction {
  type: EventPrimaryActionType;
  label: string;
  disabled: boolean;
}
