import {
  PARTNER_CARD_CATEGORY_CLASS,
  PARTNER_CARD_CLASS,
  PARTNER_CARD_LOGO_CLASS,
  PARTNER_CARD_NAME_CLASS,
  type PartnerCardProps,
} from "./PartnerCard.types";

/**
 * Butterfly PartnerCard — placeholder partner logo tile.
 */
export function PartnerCard({
  name,
  category,
  href = "#",
  className,
}: PartnerCardProps) {
  const classNames = [PARTNER_CARD_CLASS, className].filter(Boolean).join(" ");

  return (
    <article className={classNames}>
      <a href={href} className={PARTNER_CARD_LOGO_CLASS} aria-label={name}>
        <span aria-hidden="true">{name.charAt(0)}</span>
      </a>
      <h3 className={PARTNER_CARD_NAME_CLASS}>
        <a href={href}>{name}</a>
      </h3>
      {category ? (
        <p className={PARTNER_CARD_CATEGORY_CLASS}>{category}</p>
      ) : null}
    </article>
  );
}
