import { getButtonClassName } from "../Button/Button.styles";
import {
  EVENT_CARD_ACTIONS_CLASS,
  EVENT_CARD_BODY_CLASS,
  EVENT_CARD_FOOTER_CLASS,
  EVENT_CARD_IMAGE_CLASS,
  EVENT_CARD_MEDIA_CLASS,
  EVENT_CARD_META_CLASS,
  EVENT_CARD_META_ITEM_CLASS,
  EVENT_CARD_PLACEHOLDER_CLASS,
  EVENT_CARD_PRICE_CLASS,
  EVENT_CARD_TITLE_CLASS,
  getEventCardBadgeClassName,
  getEventCardClassName,
} from "./EventCard.styles";
import {
  DEFAULT_EVENT_CARD_DETAILS_LABEL,
  DEFAULT_EVENT_CARD_FREE_LABEL,
  DEFAULT_EVENT_CARD_IMAGE_PLACEHOLDER,
  EVENT_CARD_STATUS_LABELS,
  type EventCardProps,
} from "./EventCard.types";

/**
 * Butterfly EventCard — presentational race/event preview.
 * No fetching, pricing rules, or framework coupling.
 */
export function EventCard({
  title,
  date,
  dateTime,
  city,
  distance,
  price,
  status,
  statusLabel,
  image,
  href = "#",
  detailsLabel = DEFAULT_EVENT_CARD_DETAILS_LABEL,
  freeLabel = DEFAULT_EVENT_CARD_FREE_LABEL,
  className,
}: EventCardProps) {
  const badgeText = statusLabel ?? EVENT_CARD_STATUS_LABELS[status];
  const priceText = price?.trim() ? price : freeLabel;
  const imageAlt = image?.alt ?? title;
  const placeholderLabel =
    image?.placeholderLabel ?? DEFAULT_EVENT_CARD_IMAGE_PLACEHOLDER;
  const detailsClassName = getButtonClassName({ variant: "primary", size: "sm" });

  return (
    <article className={getEventCardClassName({ className })}>
      <div className={EVENT_CARD_MEDIA_CLASS}>
        {image?.src ? (
          // Consumer apps may wrap with next/image; plain img keeps the package framework-agnostic.
          <img
            src={image.src}
            alt={imageAlt}
            className={EVENT_CARD_IMAGE_CLASS}
          />
        ) : (
          <div
            className={EVENT_CARD_PLACEHOLDER_CLASS}
            role="img"
            aria-label={imageAlt}
          >
            <span aria-hidden="true">{placeholderLabel}</span>
          </div>
        )}
      </div>

      <div className={EVENT_CARD_BODY_CLASS}>
        <p className={getEventCardBadgeClassName(status)}>{badgeText}</p>

        <h3 className={EVENT_CARD_TITLE_CLASS}>{title}</h3>

        <ul className={EVENT_CARD_META_CLASS}>
          <li className={EVENT_CARD_META_ITEM_CLASS}>
            <time dateTime={dateTime ?? undefined}>{date}</time>
          </li>
          <li className={EVENT_CARD_META_ITEM_CLASS}>{city}</li>
          <li className={EVENT_CARD_META_ITEM_CLASS}>{distance}</li>
        </ul>

        <div className={EVENT_CARD_FOOTER_CLASS}>
          <p className={EVENT_CARD_PRICE_CLASS}>{priceText}</p>
          <div className={EVENT_CARD_ACTIONS_CLASS}>
            <a href={href} className={detailsClassName}>
              {detailsLabel}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
