export interface CouponCardProps {
  title: string;
  discountLabel: string;
  partnerName?: string;
  expiresAt?: string;
  href?: string;
  className?: string;
}

export const COUPON_CARD_CLASS = "butterfly-coupon-card";
export const COUPON_CARD_DISCOUNT_CLASS = "butterfly-coupon-card__discount";
export const COUPON_CARD_TITLE_CLASS = "butterfly-coupon-card__title";
export const COUPON_CARD_META_CLASS = "butterfly-coupon-card__meta";
