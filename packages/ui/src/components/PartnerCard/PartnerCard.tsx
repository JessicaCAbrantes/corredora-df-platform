/**
 * Butterfly PartnerCard — partner teaser tile.
 * When `href` is omitted, name/logo are plain text (non-clickable teaser).
 */
import {
  PARTNER_CARD_CATEGORY_CLASS,
  PARTNER_CARD_CLASS,
  PARTNER_CARD_LOGO_CLASS,
  PARTNER_CARD_NAME_CLASS,
  type PartnerCardProps,
} from "./PartnerCard.types";

export function PartnerCard({
  name,
  category,
  href,
  className,
}: PartnerCardProps) {
  const classNames = [PARTNER_CARD_CLASS, className].filter(Boolean).join(" ");
  const mark = (
    <span className={PARTNER_CARD_LOGO_CLASS} aria-hidden="true">
      {name.charAt(0)}
    </span>
  );

  return (
    <article className={classNames}>
      {href ? (
        <a href={href} className={PARTNER_CARD_LOGO_CLASS} aria-label={name}>
          <span aria-hidden="true">{name.charAt(0)}</span>
        </a>
      ) : (
        mark
      )}
      <h3 className={PARTNER_CARD_NAME_CLASS}>
        {href ? <a href={href}>{name}</a> : <span>{name}</span>}
      </h3>
      {category ? (
        <p className={PARTNER_CARD_CATEGORY_CLASS}>{category}</p>
      ) : null}
    </article>
  );
}
