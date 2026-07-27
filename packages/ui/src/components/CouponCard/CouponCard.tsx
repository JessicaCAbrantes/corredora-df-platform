import {
  COUPON_CARD_CLASS,
  COUPON_CARD_DISCOUNT_CLASS,
  COUPON_CARD_META_CLASS,
  COUPON_CARD_TITLE_CLASS,
  type CouponCardProps,
} from "./CouponCard.types";

/**
 * Butterfly CouponCard — placeholder benefit card (no real code shown).
 */
export function CouponCard({
  title,
  discountLabel,
  partnerName,
  expiresAt,
  href = "#",
  className,
}: CouponCardProps) {
  const classNames = [COUPON_CARD_CLASS, className].filter(Boolean).join(" ");

  return (
    <article className={classNames}>
      <p className={COUPON_CARD_DISCOUNT_CLASS}>{discountLabel}</p>
      <h3 className={COUPON_CARD_TITLE_CLASS}>
        <a href={href}>{title}</a>
      </h3>
      <p className={COUPON_CARD_META_CLASS}>
        {partnerName ? <span>{partnerName}</span> : null}
        {partnerName && expiresAt ? " · " : null}
        {expiresAt ? <span>Validade: {expiresAt}</span> : null}
      </p>
    </article>
  );
}
