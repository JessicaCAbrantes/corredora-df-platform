import type { EventCardStatus } from "./EventCard.types";

export const EVENT_CARD_CLASS = "butterfly-event-card";
export const EVENT_CARD_MEDIA_CLASS = "butterfly-event-card__media";
export const EVENT_CARD_IMAGE_CLASS = "butterfly-event-card__image";
export const EVENT_CARD_PLACEHOLDER_CLASS = "butterfly-event-card__placeholder";
export const EVENT_CARD_BODY_CLASS = "butterfly-event-card__body";
export const EVENT_CARD_BADGE_CLASS = "butterfly-event-card__badge";
export const EVENT_CARD_TITLE_CLASS = "butterfly-event-card__title";
export const EVENT_CARD_META_CLASS = "butterfly-event-card__meta";
export const EVENT_CARD_META_ITEM_CLASS = "butterfly-event-card__meta-item";
export const EVENT_CARD_FOOTER_CLASS = "butterfly-event-card__footer";
export const EVENT_CARD_PRICE_CLASS = "butterfly-event-card__price";
export const EVENT_CARD_ACTIONS_CLASS = "butterfly-event-card__actions";

export const EVENT_CARD_STATUS_CLASSES: Record<EventCardStatus, string> = {
  open: "butterfly-event-card__badge--open",
  closed: "butterfly-event-card__badge--closed",
  upcoming: "butterfly-event-card__badge--upcoming",
};

export interface EventCardStyleOptions {
  className?: string;
}

export function getEventCardClassName({
  className = "",
}: EventCardStyleOptions = {}): string {
  return [EVENT_CARD_CLASS, className].filter(Boolean).join(" ");
}

export function getEventCardBadgeClassName(status: EventCardStatus): string {
  return [EVENT_CARD_BADGE_CLASS, EVENT_CARD_STATUS_CLASSES[status]]
    .filter(Boolean)
    .join(" ");
}
