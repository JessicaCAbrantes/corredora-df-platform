export const HERO_BASE_CLASS = "butterfly-hero";

export const HERO_BACKGROUND_CLASS = "butterfly-hero__background";
export const HERO_OVERLAY_CLASS = "butterfly-hero__overlay";
export const HERO_INNER_CLASS = "butterfly-hero__inner";
export const HERO_CONTENT_CLASS = "butterfly-hero__content";
export const HERO_SUBTITLE_CLASS = "butterfly-hero__subtitle";
export const HERO_TITLE_CLASS = "butterfly-hero__title";
export const HERO_ACTIONS_CLASS = "butterfly-hero__actions";
export const HERO_INDICATORS_CLASS = "butterfly-hero__indicators";
export const HERO_INDICATOR_CLASS = "butterfly-hero__indicator";
export const HERO_INDICATOR_VALUE_CLASS = "butterfly-hero__indicator-value";
export const HERO_INDICATOR_LABEL_CLASS = "butterfly-hero__indicator-label";
export const HERO_MEDIA_CLASS = "butterfly-hero__media";
export const HERO_FIGURE_CLASS = "butterfly-hero__figure";
export const HERO_IMAGE_CLASS = "butterfly-hero__image";
export const HERO_IMAGE_PLACEHOLDER_CLASS = "butterfly-hero__image-placeholder";
export const HERO_SCROLL_INDICATOR_CLASS = "butterfly-hero__scroll-indicator";

/** @deprecated Alias — use HERO_INDICATORS_CLASS */
export const HERO_STATS_CLASS = HERO_INDICATORS_CLASS;
/** @deprecated Alias — use HERO_INDICATOR_CLASS */
export const HERO_STAT_ITEM_CLASS = HERO_INDICATOR_CLASS;
/** @deprecated Alias — use HERO_INDICATOR_VALUE_CLASS */
export const HERO_STAT_VALUE_CLASS = HERO_INDICATOR_VALUE_CLASS;
/** @deprecated Alias — use HERO_INDICATOR_LABEL_CLASS */
export const HERO_STAT_LABEL_CLASS = HERO_INDICATOR_LABEL_CLASS;

export interface HeroStyleOptions {
  className?: string;
}

/**
 * Composes class names for the root <section> element.
 * Plain BEM classes — no Tailwind inside the design system package.
 */
export function getHeroClassName({ className = "" }: HeroStyleOptions = {}): string {
  return [HERO_BASE_CLASS, className].filter(Boolean).join(" ");
}
