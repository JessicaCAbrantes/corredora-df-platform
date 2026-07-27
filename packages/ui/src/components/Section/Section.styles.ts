/**
 * BEM classes for ButterflySection.
 *
 * Token mapping (planned):
 * - padding-block          → spacing.section.*
 * - header gap             → spacing.stack.sm|md
 * - title                  → typography.styles.h2
 * - description            → typography.styles.body + color.muted
 */

export const SECTION_BASE_CLASS = "butterfly-section";
export const SECTION_CENTERED_CLASS = "butterfly-section--centered";
export const SECTION_HEADER_CLASS = "butterfly-section__header";
export const SECTION_TITLE_CLASS = "butterfly-section__title";
export const SECTION_DESCRIPTION_CLASS = "butterfly-section__description";
export const SECTION_HEADER_ACTIONS_CLASS = "butterfly-section__header-actions";
export const SECTION_BODY_CLASS = "butterfly-section__body";

/** @deprecated Use SECTION_HEADER_ACTIONS_CLASS */
export const SECTION_HEADER_EXTRA_CLASS = SECTION_HEADER_ACTIONS_CLASS;

export interface SectionStyleOptions {
  centered?: boolean;
  className?: string;
}

/**
 * Composes root class names — plain BEM strings, no Tailwind in JSX.
 */
export function getSectionClassName({
  centered = false,
  className = "",
}: SectionStyleOptions = {}): string {
  return [
    SECTION_BASE_CLASS,
    centered ? SECTION_CENTERED_CLASS : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
