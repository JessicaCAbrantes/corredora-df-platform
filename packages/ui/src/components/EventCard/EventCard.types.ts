/**
 * Registration-facing status shown as a badge.
 * Labels are presentational defaults — the app may override via `statusLabel`.
 */
export type EventCardStatus = "open" | "closed" | "upcoming";

/** Optional cover image — omit `src` to render the placeholder. */
export interface EventCardImage {
  src?: string;
  alt: string;
  /** Visible text inside the placeholder when `src` is missing */
  placeholderLabel?: string;
}

export interface EventCardProps {
  /** Race name */
  title: string;
  /** Human-readable date (i18n-ready string from the app) */
  date: string;
  /** Optional machine-readable value for <time dateTime> */
  dateTime?: string;
  /** City label */
  city: string;
  /** Primary distance (e.g. "10K", "21K") */
  distance: string;
  /**
   * Price display string. When omitted / empty, the card shows `freeLabel`.
   * Formatting belongs to the consumer — no currency logic here.
   */
  price?: string;
  /** Status drives the badge modifier class */
  status: EventCardStatus;
  /**
   * Badge copy override. When omitted, uses `EVENT_CARD_STATUS_LABELS[status]`.
   */
  statusLabel?: string;
  image?: EventCardImage;
  /** Details destination — rendered as an anchor styled like Button */
  href?: string;
  /** CTA label @default "Ver detalhes" */
  detailsLabel?: string;
  /** Label when there is no price @default "Gratuito" */
  freeLabel?: string;
  className?: string;
}

export const DEFAULT_EVENT_CARD_DETAILS_LABEL = "Ver detalhes";
export const DEFAULT_EVENT_CARD_FREE_LABEL = "Gratuito";
export const DEFAULT_EVENT_CARD_IMAGE_PLACEHOLDER = "Imagem da corrida";

export const EVENT_CARD_STATUS_LABELS: Record<EventCardStatus, string> = {
  open: "Inscrições abertas",
  closed: "Encerradas",
  upcoming: "Em breve",
};
