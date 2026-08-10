/**
 * Butterfly KitCard — kit pickup summary teaser.
 * When `href` is omitted, the title is plain text (non-clickable).
 */
import {
  KIT_CARD_CLASS,
  KIT_CARD_EVENT_CLASS,
  KIT_CARD_PICKUP_CLASS,
  KIT_CARD_STATUS_CLASS,
  KIT_CARD_TITLE_CLASS,
  type KitCardProps,
} from "./KitCard.types";

export function KitCard({
  title,
  eventName,
  statusLabel,
  pickupLabel,
  href,
  className,
}: KitCardProps) {
  const classNames = [KIT_CARD_CLASS, className].filter(Boolean).join(" ");

  return (
    <article className={classNames}>
      <p className={KIT_CARD_STATUS_CLASS}>{statusLabel}</p>
      <h3 className={KIT_CARD_TITLE_CLASS}>
        {href ? <a href={href}>{title}</a> : <span>{title}</span>}
      </h3>
      <p className={KIT_CARD_EVENT_CLASS}>{eventName}</p>
      {pickupLabel ? (
        <p className={KIT_CARD_PICKUP_CLASS}>{pickupLabel}</p>
      ) : null}
    </article>
  );
}
