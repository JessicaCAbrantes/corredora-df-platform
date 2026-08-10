/**
 * Butterfly CouponCard — benefit teaser.
 * When `href` is omitted, the title is plain text (non-clickable teaser).
 */
import {
  COUPON_CARD_CLASS,
  COUPON_CARD_DISCOUNT_CLASS,
  COUPON_CARD_META_CLASS,
  COUPON_CARD_TITLE_CLASS,
  type CouponCardProps,
} from "./CouponCard.types";

export function CouponCard({
  title,
  discountLabel,
  partnerName,
  expiresAt,
  href,
  className,
}: CouponCardProps) {
  const classNames = [COUPON_CARD_CLASS, className].filter(Boolean).join(" ");

  return (
    <article className={classNames}>
      <p className={COUPON_CARD_DISCOUNT_CLASS}>{discountLabel}</p>
      <h3 className={COUPON_CARD_TITLE_CLASS}>
        {href ? <a href={href}>{title}</a> : <span>{title}</span>}
      </h3>
      <p className={COUPON_CARD_META_CLASS}>
        {partnerName ? <span>{partnerName}</span> : null}
        {partnerName && expiresAt ? " · " : null}
        {expiresAt ? <span>Validade: {expiresAt}</span> : null}
      </p>
    </article>
  );
}
