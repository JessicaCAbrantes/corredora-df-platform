export interface KitCardProps {
  title: string;
  eventName: string;
  statusLabel: string;
  pickupLabel?: string;
  href?: string;
  className?: string;
}

export const KIT_CARD_CLASS = "butterfly-kit-card";
export const KIT_CARD_TITLE_CLASS = "butterfly-kit-card__title";
export const KIT_CARD_EVENT_CLASS = "butterfly-kit-card__event";
export const KIT_CARD_STATUS_CLASS = "butterfly-kit-card__status";
export const KIT_CARD_PICKUP_CLASS = "butterfly-kit-card__pickup";
